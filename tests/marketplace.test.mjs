import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const marketplace = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'))
const plugins = marketplace.plugins
const names = new Set(plugins.map(p => p.name))
const remote = plugins.filter(p => typeof p.source === 'object')
const repoOf = s => (s.source === 'github' ? s.repo : s.url)

describe('marketplace.json (offline)', () => {
  test('plugin names are unique', () => {
    assert.equal(names.size, plugins.length)
  })

  test('every remote source is pinned by a full sha', () => {
    for (const p of remote) {
      assert.match(p.source.sha ?? '', /^[0-9a-f]{40}$/, `${p.name}: sha missing or truncated`)
    }
  })

  test('every dependency names a plugin of the marketplace', () => {
    for (const p of plugins) {
      for (const dep of p.dependencies ?? []) {
        assert.ok(names.has(dep), `${p.name} depends on ${dep}, which is not in the marketplace`)
      }
    }
  })

  test('a plugin without a remote source is a meta-plugin (empty skills)', () => {
    for (const p of plugins.filter(p => typeof p.source === 'string')) {
      assert.deepEqual(p.skills, [], `${p.name} : source locale mais skills non vides`)
    }
  })
})

describe('opencode.jsonc', () => {
  const text = readFileSync(join(ROOT, 'opencode.jsonc'), 'utf8')
  const shaOf = name => plugins.find(p => p.name === name).source.sha

  const active = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n')

  test('mishell-base is enabled: fabnum-cicd as a plugin, transversal-doc in skills.urls, at the marketplace sha', () => {
    assert.ok(
      active.includes(`"fabnum-cicd@git+https://github.com/dnum-mi/fabnum-cicd.git#${shaOf('fabnum-cicd-skills')}"`),
      'fabnum-cicd: entry missing or sha different from fabnum-cicd-skills in marketplace.json',
    )
    assert.ok(
      active.includes(`"https://raw.githubusercontent.com/dnum-mi/transversal-doc/${shaOf('fabnum-transversal-skills')}/.agents/skills/"`),
      'transversal-doc: URL missing or sha different from fabnum-transversal-skills in marketplace.json',
    )
  })

  test('the transversal-doc plugin is not enabled on top of skills.urls (skills loaded twice)', () => {
    assert.ok(!active.includes('transversal-doc@git+'))
  })
})

// MISHELL_ONLINE=1: does the sha exist on the upstream repository? (otherwise the installation fails)
describe('pinned sources (network)', { skip: !process.env.MISHELL_ONLINE }, () => {
  for (const p of remote) {
    test(`${p.name}: sha present on ${repoOf(p.source)}`, () => {
      const dir = mkdtempSync(join(tmpdir(), 'mishell-sha-'))
      try {
        const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' })
        git('init', '-q')
        git('fetch', '-q', '--depth', '1', `https://github.com/${repoOf(p.source)}.git`, p.source.sha)
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })
  }
})

// MISHELL_CLAUDE=1: installs the bundles in an isolated Claude Code config (without touching yours,
// no login and no model call) and reads each plugin's inventory with `plugin details`.
describe('Claude Code installation (network)', { skip: !process.env.MISHELL_CLAUDE }, () => {
  const config = mkdtempSync(join(tmpdir(), 'mishell-claude-'))
  after(() => rmSync(config, { recursive: true, force: true }))
  const claude = (...args) =>
    execFileSync('claude', ['plugin', ...args], { encoding: 'utf8', env: { ...process.env, CLAUDE_CONFIG_DIR: config } })

  test('the bundles install with their dependencies', () => {
    claude('marketplace', 'add', ROOT)
    for (const bundle of ['mishell-base', 'mishell-more']) {
      claude('install', `${bundle}@${marketplace.name}`, '--scope', 'user')
    }
  })

  for (const p of plugins) {
    test(`${p.name} exposes ${p.skills?.length === 0 ? 'no skill (meta-plugin)' : 'skills'}`, () => {
      const out = claude('details', p.name)
      const count = Number(/Skills \((\d+)\)/.exec(out)?.[1])
      if (p.skills?.length === 0) assert.equal(count, 0, out)
      else assert.ok(count > 0, `no skill exposed:\n${out}`)
    })
  }
})
