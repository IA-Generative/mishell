import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'

import {
  BUNDLE, RUNS, THRESHOLD, bundlePlugins, listOpenCodeSkills, loadQueries, measure, passes, queriesPath,
  runClaude, runOpenCode, setupClaude, setupOpenCode, workspace, workspaceForOpenCode, PRIVATE,
} from './lib/harness.mjs'
import { join } from 'node:path'

const queries = loadQueries()

describe('eval_queries.json (offline)', () => {
  test('every query is { query, should_trigger } and nothing else', () => {
    for (const q of queries) {
      assert.deepEqual(Object.keys(q).sort(), ['query', 'should_trigger'], JSON.stringify(q))
      assert.equal(typeof q.query, 'string')
      assert.ok(q.query.trim().length > 20, `query too short to be a real intent: ${q.query}`)
      assert.equal(typeof q.should_trigger, 'boolean')
    }
  })

  test('queries are unique and cover both outcomes', () => {
    assert.equal(new Set(queries.map(q => q.query)).size, queries.length)
    assert.ok(queries.some(q => q.should_trigger), 'no query that should trigger')
    assert.ok(queries.some(q => !q.should_trigger), 'no near-miss')
  })

  test('a query states an intent: it names no plugin of the bundle', () => {
    const names = [...bundlePlugins()].flatMap(n => [n, ...n.split('-').filter(w => w.length > 4)])
    for (const q of queries) {
      for (const name of names) assert.ok(!q.query.toLowerCase().includes(name), `"${name}" in: ${q.query}`)
    }
  })
})

// MISHELL_LLM=1 + a model per agent: does the bundle get used when the intent calls for it?
// A query that should trigger passes if ANY skill of the bundle is invoked (which one is left to the
// skills' own descriptions and is only reported); a near-miss passes if none is.
function triggerSuite(title, { model, modelVar, prepare }) {
  const skip = !process.env.MISHELL_LLM ? 'MISHELL_LLM is not set'
    : !model ? `${modelVar} is not set`
      : false
  describe(`${title} triggers (${model ?? 'no model'}, ${RUNS} runs, threshold ${THRESHOLD})`, { skip }, () => {
    let agent
    before(async () => { agent = await prepare(model) })
    after(() => agent?.cleanup())

    for (const { query, should_trigger: shouldTrigger } of queries) {
      test(`${shouldTrigger ? 'triggers' : 'near-miss '} | ${query}`, async () => {
        const m = await measure(q => agent.attempt(q), query)
        console.log(`TRIGGER ${title} ${m.triggers}/${m.runs} ${shouldTrigger ? 'should' : 'should-not'} used=[${m.used.join(',')}] errors=${m.errors.length} | ${query}`)
        assert.ok(!m.inconclusive, `inconclusive, only ${m.runs} valid run(s): ${m.errors.map(e => e.error).join(' ; ')}`)
        assert.ok(
          passes(shouldTrigger, m.rate),
          `${shouldTrigger ? 'expected a skill' : 'expected no skill'} but the trigger rate is ${m.triggers}/${m.runs} (${m.used.join(', ') || 'none'})`,
        )
      })
    }
  })
}

triggerSuite('Claude Code', {
  model: process.env.MISHELL_CLAUDE_MODEL,
  modelVar: 'MISHELL_CLAUDE_MODEL',
  async prepare(model) {
    const claude = setupClaude()
    const ws = workspace('CLAUDE.md')
    return {
      cleanup() { ws.cleanup(); claude.cleanup() },
      attempt: query => runClaude({ env: claude.env, cwd: ws.dir, model, query }),
    }
  },
})

triggerSuite('OpenCode', {
  model: process.env.MISHELL_OPENCODE_MODEL,
  modelVar: 'MISHELL_OPENCODE_MODEL',
  async prepare(model) {
    const opencode = setupOpenCode({ base: join(PRIVATE, 'opencode'), model })
    const ws = workspaceForOpenCode()
    const skills = listOpenCodeSkills({ env: opencode.env, cwd: ws.dir })
    return {
      cleanup() { ws.cleanup(); opencode.cleanup() },
      attempt: query => runOpenCode({ env: opencode.env, cwd: ws.dir, model, query, skills }),
    }
  },
})

console.log(`# queries: ${queriesPath()} (${BUNDLE})`)
