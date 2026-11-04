// Shared helpers for the local tests that drive a real agent (Claude Code or OpenCode).
// Everything generated here (isolated configs, copied credentials) lives under `private/`,
// which git ignores; the agents run in a throw-away workspace OUTSIDE the repository so that
// neither the repository's own instructions nor its settings leak into a run.
import { execFileSync, spawn } from 'node:child_process'
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('../..', import.meta.url))
export const PRIVATE = join(ROOT, 'private')
export const BUNDLE = 'mishell-base'
export const CONTEXT = 'Ce dépôt est un projet de la Fabrique Numérique.\n'
export const ATTEMPT_TIMEOUT_MS = 90_000

export const marketplace = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'))

// The plugins a bundle pulls in (itself included), so that no skill name is hard-coded anywhere.
export function bundlePlugins(name = BUNDLE, seen = new Set()) {
  if (seen.has(name)) return seen
  seen.add(name)
  const plugin = marketplace.plugins.find(p => p.name === name)
  for (const dep of plugin?.dependencies ?? []) bundlePlugins(dep.name ?? dep, seen)
  return seen
}

export const stripLineComments = text =>
  text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n')

// ── Safety: never write a secret in a place git would pick up ──────────────────────────────────
function assertIgnored(path) {
  try {
    execFileSync('git', ['-C', ROOT, 'check-ignore', '-q', path], { stdio: 'pipe' })
  } catch {
    throw new Error(`${path} is not ignored by git: refusing to write credentials there`)
  }
}

function privateDir(...parts) {
  mkdirSync(PRIVATE, { recursive: true, mode: 0o700 })
  chmodSync(PRIVATE, 0o700)
  const dir = join(PRIVATE, ...parts)
  assertIgnored(dir)
  mkdirSync(dir, { recursive: true, mode: 0o700 })
  return dir
}

export function workspace(contextFile) {
  const dir = mkdtempSync(join(tmpdir(), 'mishell-ws-'))
  writeFileSync(join(dir, contextFile), CONTEXT)
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

// ── Running an agent and stopping it as soon as the question is answered ───────────────────────
// `onEvent(event)` returns an object to settle the run, or undefined to keep reading.
function runAgent(cmd, args, { cwd, env, onEvent }) {
  return new Promise(resolve => {
    const child = spawn(cmd, args, { cwd, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let buffer = ''
    let stderr = ''
    let settled = false
    const events = []
    const settle = outcome => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { process.kill(-child.pid, 'SIGKILL') } catch { /* already gone */ }
      resolve({ events: events.length, ...outcome })
    }
    const timer = setTimeout(() => settle({ error: `timeout after ${ATTEMPT_TIMEOUT_MS / 1000}s` }), ATTEMPT_TIMEOUT_MS)
    child.stdout.on('data', chunk => {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (!line.trim()) continue
        let event
        try { event = JSON.parse(line) } catch { continue }
        events.push(event)
        const outcome = onEvent(event)
        if (outcome) settle(outcome)
      }
    })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', error => settle({ error: error.message }))
    child.on('close', code => settle(code === 0 && events.length
      ? { invoked: null }
      : { error: `exit ${code}: ${stderr.replace(/\x1b\[[0-9;]*m/g, '').trim().slice(-300)}` }))
  })
}

// ── Claude Code ─────────────────────────────────────────────────────────────────────────────────
export function setupClaude() {
  const dir = privateDir('claude-config')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true, mode: 0o700 })
  const credentials = process.env.MISHELL_CLAUDE_CREDENTIALS ?? join(homedir(), '.claude/.credentials.json')
  if (!existsSync(credentials)) throw new Error(`no Claude credentials at ${credentials} (MISHELL_CLAUDE_CREDENTIALS)`)
  copyFileSync(credentials, join(dir, '.credentials.json'))
  chmodSync(join(dir, '.credentials.json'), 0o600)
  const env = { ...process.env, CLAUDE_CONFIG_DIR: dir }
  const plugin = (...args) => execFileSync('claude', ['plugin', ...args], { env, encoding: 'utf8', stdio: 'pipe' })
  plugin('marketplace', 'add', ROOT)
  plugin('install', `${BUNDLE}@${marketplace.name}`, '--scope', 'user')
  return { env, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

export async function runClaude({ env, cwd, model, query }) {
  const plugins = bundlePlugins()
  let cost
  const outcome = await runAgent('claude', [
    '-p', query, '--model', model, '--output-format', 'stream-json', '--verbose',
    // Skill plus harmless read-only tools: with the skill as the only tool, it would always be picked.
    '--tools', 'Skill,Read,Glob,Grep', '--allowedTools', 'Skill,Read,Glob,Grep', '--max-turns', '5', '--max-budget-usd', '0.25',
    '--no-session-persistence',
  ], {
    cwd,
    env,
    onEvent(event) {
      if (event.type === 'result') {
        cost = event.total_cost_usd
        return event.is_error ? { error: `result error: ${String(event.result).slice(0, 200)}` } : { invoked: null }
      }
      for (const part of event.type === 'assistant' ? event.message.content : []) {
        if (part.type === 'tool_use' && part.name === 'Skill') return { invoked: part.input?.skill ?? '?' }
      }
    },
  })
  // `plugin:skill` for a skill of the bundle; Claude Code's own skills carry no prefix.
  const triggered = Boolean(outcome.invoked?.includes(':') && plugins.has(outcome.invoked.split(':')[0]))
  return { ...outcome, triggered, cost }
}

// ── OpenCode ────────────────────────────────────────────────────────────────────────────────────
// `base` holds the four XDG directories; `provider` is a model id (`provider/model`) whose provider
// block is copied from the user's own OpenCode config into the isolated one, and nothing else.
export function setupOpenCode({ base, model } = {}) {
  const dir = base ?? mkdtempSync(join(tmpdir(), 'mishell-opencode-'))
  const xdg = Object.fromEntries(['config', 'data', 'cache', 'state'].map(n => {
    const path = join(dir, n)
    mkdirSync(path, { recursive: true, mode: 0o700 })
    return [`XDG_${n.toUpperCase()}_HOME`, path]
  }))
  const configFile = join(xdg.XDG_CONFIG_HOME, 'opencode/opencode.json')
  rmSync(configFile, { force: true })
  if (model) {
    const source = process.env.MISHELL_OPENCODE_CONFIG ?? join(homedir(), '.config/opencode/opencode.json')
    const providerId = model.split('/')[0]
    const block = existsSync(source)
      ? JSON.parse(stripLineComments(readFileSync(source, 'utf8'))).provider?.[providerId]
      : undefined
    if (block) {
      assertIgnored(configFile)
      mkdirSync(join(xdg.XDG_CONFIG_HOME, 'opencode'), { recursive: true, mode: 0o700 })
      writeFileSync(configFile, JSON.stringify({ $schema: 'https://opencode.ai/config.json', provider: { [providerId]: block } }, null, 2))
      chmodSync(configFile, 0o600)
    }
  }
  const env = {
    ...process.env,
    ...xdg,
    OPENCODE_DISABLE_EXTERNAL_SKILLS: '1',
    OPENCODE_DISABLE_AUTOUPDATE: '1',
    // Nothing that acts or reaches out; reading stays possible, so that a skill is a choice among
    // real alternatives. (A `"*": "deny"` would hide the skill tool itself.)
    OPENCODE_PERMISSION: JSON.stringify({
      bash: 'deny', edit: 'deny', webfetch: 'deny', websearch: 'deny', task: 'deny', external_directory: 'deny', skill: 'allow',
    }),
  }
  return { env, cleanup: () => rmSync(configFile, { force: true }), dir }
}

// The project config of a workspace: the very `opencode.jsonc` that users are told to copy.
export function workspaceForOpenCode() {
  const ws = workspace('AGENTS.md')
  copyFileSync(join(ROOT, 'opencode.jsonc'), join(ws.dir, 'opencode.jsonc'))
  return ws
}

export function listOpenCodeSkills({ env, cwd }) {
  const out = execFileSync('opencode', ['debug', 'skill'], {
    env, cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 300_000, maxBuffer: 64 * 1024 * 1024,
  })
  return JSON.parse(out.slice(out.indexOf('[')))
}

export async function runOpenCode({ env, cwd, model, query, skills }) {
  const known = new Set(skills.filter(s => s.location !== '<built-in>').map(s => s.name))
  const outcome = await runAgent('opencode', ['run', '--format', 'json', '-m', model, query], {
    cwd,
    env,
    onEvent(event) {
      const part = event.part ?? {}
      if (event.type === 'tool_use' && part.tool === 'skill') return { invoked: part.state?.input?.name ?? '?' }
      if (event.type === 'error') return { error: JSON.stringify(event.error ?? event).slice(0, 300) }
      if (event.type === 'step_finish' && part.reason === 'stop') return { invoked: null }
    },
  })
  return { ...outcome, triggered: Boolean(outcome.invoked && known.has(outcome.invoked)) }
}

// ── Queries ─────────────────────────────────────────────────────────────────────────────────────
export const queriesPath = () => process.env.MISHELL_QUERIES ?? join(ROOT, 'tests/eval_queries.json')
export const loadQueries = () => JSON.parse(readFileSync(queriesPath(), 'utf8'))

export const THRESHOLD = 0.5
export const RUNS = Number(process.env.MISHELL_RUNS ?? 3)

// agentskills.io: a should-trigger query passes above the threshold, a near-miss below it.
export const passes = (shouldTrigger, rate) => (shouldTrigger ? rate > THRESHOLD : rate < THRESHOLD)

// An attempt that ends in an error (provider hiccup, timeout) is replayed once, then left out of the
// rate: it says nothing about triggering. With fewer than 2 valid runs left, the query is inconclusive.
export const MIN_VALID_RUNS = 2

export async function measure(attempt, query) {
  const once = async () => {
    const first = await attempt(query)
    return first.error ? attempt(query) : first
  }
  const results = await Promise.all(Array.from({ length: RUNS }, once))
  const valid = results.filter(r => !r.error)
  const triggers = valid.filter(r => r.triggered).length
  const used = [...new Set(valid.map(r => r.invoked).filter(Boolean))]
  return {
    triggers,
    runs: valid.length,
    rate: valid.length ? triggers / valid.length : NaN,
    errors: results.filter(r => r.error),
    inconclusive: valid.length < MIN_VALID_RUNS,
    used,
  }
}
