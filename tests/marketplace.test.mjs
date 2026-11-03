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

describe('marketplace.json (hors ligne)', () => {
  test('les noms de plugins sont uniques', () => {
    assert.equal(names.size, plugins.length)
  })

  test('chaque source distante est épinglée par un sha complet', () => {
    for (const p of remote) {
      assert.match(p.source.sha ?? '', /^[0-9a-f]{40}$/, `${p.name} : sha absent ou tronqué`)
    }
  })

  test('chaque dépendance désigne un plugin de la marketplace', () => {
    for (const p of plugins) {
      for (const dep of p.dependencies ?? []) {
        assert.ok(names.has(dep), `${p.name} dépend de ${dep}, absent de la marketplace`)
      }
    }
  })

  test('un plugin sans source distante est un méta-plugin (skills vides)', () => {
    for (const p of plugins.filter(p => typeof p.source === 'string')) {
      assert.deepEqual(p.skills, [], `${p.name} : source locale mais skills non vides`)
    }
  })
})

describe('opencode.jsonc', () => {
  const text = readFileSync(join(ROOT, 'opencode.jsonc'), 'utf8')
  const shaOf = name => plugins.find(p => p.name === name).source.sha

  const active = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n')

  test('mishell-base est actif : fabnum-cicd en plugin, transversal-doc en skills.urls, au sha de la marketplace', () => {
    assert.ok(
      active.includes(`"fabnum-cicd@git+https://github.com/dnum-mi/fabnum-cicd.git#${shaOf('fabnum-cicd-skills')}"`),
      'fabnum-cicd : entrée absente ou sha différent de fabnum-cicd-skills dans marketplace.json',
    )
    assert.ok(
      active.includes(`"https://raw.githubusercontent.com/dnum-mi/transversal-doc/${shaOf('fabnum-transversal-skills')}/.agents/skills/"`),
      'transversal-doc : URL absente ou sha différent de fabnum-transversal-skills dans marketplace.json',
    )
  })

  test('le plugin transversal-doc n’est pas actif en plus de skills.urls (skills chargées deux fois)', () => {
    assert.ok(!active.includes('transversal-doc@git+'))
  })
})

// MISHELL_ONLINE=1 : le sha existe-t-il bien sur le dépôt amont ? (sinon l'installation échoue)
describe('sources épinglées (réseau)', { skip: !process.env.MISHELL_ONLINE }, () => {
  for (const p of remote) {
    test(`${p.name} : sha présent sur ${repoOf(p.source)}`, () => {
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

// MISHELL_CLAUDE=1 : installe les bundles dans une config Claude Code isolée (sans toucher à la
// vôtre, sans login ni appel modèle) et lit l'inventaire de chaque plugin avec `plugin details`.
describe('installation Claude Code (réseau)', { skip: !process.env.MISHELL_CLAUDE }, () => {
  const config = mkdtempSync(join(tmpdir(), 'mishell-claude-'))
  after(() => rmSync(config, { recursive: true, force: true }))
  const claude = (...args) =>
    execFileSync('claude', ['plugin', ...args], { encoding: 'utf8', env: { ...process.env, CLAUDE_CONFIG_DIR: config } })

  test('les bundles s’installent avec leurs dépendances', () => {
    claude('marketplace', 'add', ROOT)
    for (const bundle of ['mishell-base', 'mishell-more']) {
      claude('install', `${bundle}@${marketplace.name}`, '--scope', 'user')
    }
  })

  for (const p of plugins) {
    test(`${p.name} expose ${p.skills?.length === 0 ? 'aucune skill (méta-plugin)' : 'des skills'}`, () => {
      const out = claude('details', p.name)
      const count = Number(/Skills \((\d+)\)/.exec(out)?.[1])
      if (p.skills?.length === 0) assert.equal(count, 0, out)
      else assert.ok(count > 0, `aucune skill exposée :\n${out}`)
    })
  }
})
