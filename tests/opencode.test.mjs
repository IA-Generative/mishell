import assert from 'node:assert/strict'
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { after, before, describe, test } from 'node:test'

import { ROOT, listOpenCodeSkills, setupOpenCode, stripLineComments, workspaceForOpenCode } from './lib/harness.mjs'

// MISHELL_OPENCODE=1: OpenCode loads the sources of opencode.jsonc in an isolated config (temporary
// XDG directories, no login, no model call) and `opencode debug skill` lists what it found.
describe('OpenCode installation (network)', { skip: !process.env.MISHELL_OPENCODE }, () => {
  const config = JSON.parse(stripLineComments(readFileSync(join(ROOT, 'opencode.jsonc'), 'utf8')))
  const isolated = setupOpenCode()
  const ws = workspaceForOpenCode()
  let skills

  before(() => {
    skills = listOpenCodeSkills({ env: isolated.env, cwd: ws.dir }).filter(s => s.location !== '<built-in>')
  })
  after(() => {
    ws.cleanup()
    rmSync(isolated.dir, { recursive: true, force: true })
  })

  test('skills are loaded', () => {
    assert.ok(skills.length > 0, 'opencode debug skill lists no skill')
  })

  test('no skill name is loaded twice (names are flat under OpenCode)', () => {
    const names = skills.map(s => s.name)
    assert.deepEqual(names.filter((n, i) => names.indexOf(n) !== i), [])
  })

  for (const entry of config.plugin ?? []) {
    const name = (Array.isArray(entry) ? entry[0] : entry).split('@')[0]
    test(`plugin ${name} exposes skills`, () => {
      assert.ok(skills.some(s => s.location.includes(`/packages/${name}@`)), `no skill comes from the ${name} plugin`)
    })
  }

  for (const url of config.skills?.urls ?? []) {
    test(`skills.urls ${url.replace(/^https:\/\/[^/]+\//, '').slice(0, 60)} exposes skills`, () => {
      assert.ok(
        skills.some(s => /\/opencode\/skills\//.test(s.location)),
        'no skill comes from skills.urls',
      )
    })
  }
})
