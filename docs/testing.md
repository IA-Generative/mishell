# Testing

Everything runs locally with `node --test tests/*.test.mjs` (Node built-ins only, no dependency).
Without any variable, only the offline checks run. Each family below is switched on by a variable.

| Variable | What it checks | Needs |
|---|---|---|
| *(none)* | structure, full shas, dependencies, `opencode.jsonc` sha consistency, `eval_queries.json` shape | Node |
| `MISHELL_ONLINE=1` | every pinned `sha` exists upstream | `git`, network |
| `MISHELL_CLAUDE=1` | the Claude Code bundles install and expose skills (isolated config, no login, no model) | `claude`, network |
| `MISHELL_OPENCODE=1` | OpenCode loads the sources of `opencode.jsonc`: skills found, none loaded twice, each source exposes some (isolated config, no login, no model) | `opencode`, network |
| `MISHELL_LLM=1` | the bundle is **used** when the user's intent calls for it (see below) | a model per agent |

## Do the skills get used?

`tests/eval_queries.json` holds queries written as a user's **intent** (`query`, `should_trigger`). For each
agent, every query is sent 3 times (`MISHELL_RUNS`) to a real model, and a run stops at the first skill
call. Following [agentskills.io](https://agentskills.io/skill-creation/optimizing-descriptions):

- a query that should trigger passes if the trigger rate is **above 0.5**: *any* skill of the bundle was
  invoked. Which one is left to the skills' own descriptions and is only reported (`used=[…]`);
- a near-miss (`should_trigger: false`) passes if the rate is **below 0.5**: no skill of the bundle.

```bash
MISHELL_LLM=1 \
MISHELL_CLAUDE_MODEL=sonnet \
MISHELL_OPENCODE_MODEL=scaleway/deepseek-v4-flash-0731 \
node --test tests/triggers.test.mjs
```

There is no default model: an agent whose variable is unset is skipped. Each query prints a
`TRIGGER <agent> <hits>/<runs> … used=[…] | <query>` line, whether it passes or not.

### How a run is isolated

- The agent runs in a throw-away workspace **outside** the repository, with a one-line instruction file
  saying it is a Fabrique Numérique project (`CLAUDE.md` / `AGENTS.md`). Otherwise the repository's own
  instructions and settings would leak into the run.
- The agent can read and search the (empty) workspace but cannot act or reach out: a skill is one
  choice among real alternatives. With the skill as the only tool it would always be picked, and the
  test would prove nothing.
- Claude Code: a config under `private/claude-config/` holding **a copy of your `~/.claude/.credentials.json`**
  (`MISHELL_CLAUDE_CREDENTIALS` to change the source) and the bundle installed from this checkout; it is
  deleted when the suite ends.
- OpenCode: four XDG directories under `private/opencode/`, the `opencode.jsonc` of this repository as the
  project config, and **only the provider block of the chosen model**, read from your own OpenCode config
  (`MISHELL_OPENCODE_CONFIG`, default `~/.config/opencode/opencode.json`); that file is deleted when the
  suite ends. A provider with no block there (built-in or free models) runs without one.
- `private/` is git-ignored and the harness refuses to write a secret anywhere git would not ignore.
  `rm -rf private/claude-config private/opencode` removes everything.

### Writing a query

A query describes **what the person wants**, in plain words, and names no tool, workflow or skill: a
query that repeats a description's vocabulary passes by keyword matching and proves nothing. A test
rejects queries that contain the name of a plugin of the bundle. Prefer:

- situations where a skill would help but the link is not obvious from the wording;
- **near-misses** that share a theme with the bundle but need something else (a generic bug, a
  conceptual question).

A query that is relevant but never triggers is not a bad query: it is a weak skill description, which
belongs to the upstream repository. Report it there rather than keeping a test that always fails.

### Refreshing the queries

After a `sha` bump that adds or removes skills, or when the results look too easy or too hard: draft
candidates, have a second model with a fresh context judge each one against the skills' descriptions
(in scope or not, vocabulary copied or not), run the survivors with `MISHELL_QUERIES=<candidates.json>`,
and keep a mix of easy queries (3/3 on both agents) and discriminating ones (1 or 2 out of 3). Nothing of
this process is versioned: only the resulting `tests/eval_queries.json`.

## Scope

Only `mishell-base` is covered by the model tests, on both agents: it is the one bundle that exists as
such on Claude Code and OpenCode (`mishell-more` contains sources with no OpenCode plugin, see
[installation](installation.md#sources-without-an-opencode-plugin)). There is no CI yet: the model-free
checks (`MISHELL_ONLINE`, `MISHELL_CLAUDE`, `MISHELL_OPENCODE`, `claude plugin validate .`) only need
`node`, `git` and the two CLIs, and are the candidates for it.
