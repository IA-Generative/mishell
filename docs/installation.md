# Installation

The repository is **public**: no GitHub login is required. `git` must be installed.

| Agent | Route |
|---|---|
| Claude Code | [`mishell` marketplace](#claude-code) |
| OpenCode | [`agent-skills` and `starter-kit-opencode` plugins](#opencode) |

The same content can be chosen on both agents, by bundle or by group:
[pick and choose](#pick-and-choose).

## Claude Code

```bash
claude plugin marketplace add IA-Generative/mishell
claude plugin install mishell-base@mishell     # Fabrique Numérique foundation
claude plugin install mishell-more@mishell     # audit, accreditation, ANSSI, RGAA, CPiN (optional)
```

- `marketplace add` only registers the catalogue: no skill is loaded before `install`.
- Then run `/reload-plugins`; `claude plugin list` must show the plugin as `enabled`.
- `IA-Generative/mishell` is the source; `mishell` is the name of the marketplace.
- `--scope local`: this project only, without changing versioned files (default `user`: all your
  sessions; `project`: shared with the team through git).
- Update and removal: [Update](#update) and [Uninstall](#uninstall).

## OpenCode

OpenCode does not read the `mishell` marketplace: it loads **plugins** and **skill folders** declared
in `opencode.json` (the project's, or `~/.config/opencode/opencode.json`). Requirements: OpenCode
≥ 1.18, `git` and access to github.com. Tested with OpenCode 1.18.35: `opencode debug config` and
`opencode debug skill` list the expected skills (no model session).

The simplest way: copy [`opencode.jsonc`](../opencode.jsonc) (at the root of this repository) into the
`opencode.json` of your project. It enables **`mishell-base`** by default, both sources pinned by
commit, with the extras commented out and permissions ready to adapt:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["fabnum-cicd@git+https://github.com/dnum-mi/fabnum-cicd.git#<sha>"],
  "skills": { "urls": ["https://raw.githubusercontent.com/dnum-mi/transversal-doc/<sha>/.agents/skills/"] }
}
```

`<sha>`: the commit of `fabnum-cicd-skills` (first line) and of `fabnum-transversal-skills` (second line)
in [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) (`opencode.jsonc` already
carries them; a test checks that they stay identical). `transversal-doc` goes through `skills.urls`
and not through a plugin: its repository is a documentation site, and the plugin would install all of
its dependencies. The extras:

- **`agent-skills`**: the team's skills, by `groups` (`dev`, `audit`, `repo`, `dat`, `mirai`; default:
  all). `mishell-agent-skills` is the equivalent for `audit`, `dat` and `mirai`.
- **`starter-kit-opencode`**: the Fabrique Numérique / Cloud Pi Native kit, by `groups` (`dev`, `dso`),
  with instructions, agents and commands: [the full DSO kit](#full-dso-kit).
- A plugin is downloaded by OpenCode into its cache, nothing is written in the project. It **follows
  `main`**; to pin a version, add `#<sha>` to the URL (`….git#<sha>`).
- Restart OpenCode after any change to `opencode.json`. Update and removal: [Update](#update) and
  [Uninstall](#uninstall).
- Skill names are flat under OpenCode: do not load the same skill through two routes
  ([duplicates](#avoid-duplicates)).

The `allow` / `ask` / `deny` permission rules of [`opencode.jsonc`](../opencode.jsonc) are meant to be
adapted; only `etalab-ia/skills` (`mishell-more`) has no OpenCode plugin:
[sources without an OpenCode plugin](#sources-without-an-opencode-plugin).

## Pick and choose

To take only one family of skills, for example **DSO / Cloud Pi Native**.

| Claude Code plugin (`mishell` marketplace) | Content | OpenCode |
|---|---|---|
| `mishell-agent-skills` | 5 audit skills (repository opening, pen-test, red-team, RAG, OpenWebUI tools), 2 DAT accreditation skills (generation, `.docx` rendering), 2 MirAI skills | `agent-skills` plugin, `"groups": ["audit", "dat", "mirai"]` |
| `starter-dso-skills` | 3 DSO / Cloud Pi Native skills (fabnum CI/CD, Helm chart, deployment) | [`skills.urls`](#dso-skills-only) |
| `fabnum-cicd-skills`, `fabnum-transversal-skills` | the two halves of the `mishell-base` foundation | `fabnum-cicd` plugin (`#<sha>`) and `skills.urls` for `transversal-doc` |
| `etalab-anssi-guides`, `etalab-rgaa` | ANSSI guides; RGAA reference | [no plugin](#sources-without-an-opencode-plugin) |

`mishell-base` and `mishell-more` group these plugins. Several can be combined, on Claude Code as on
OpenCode (several entries in `plugin`, or several `groups`).

### DSO skills only

The three skills of the `dso` group of `starter-kit-opencode`, **pinned to a commit**, without
instructions, agents or commands.

```bash
# Claude Code
claude plugin marketplace add IA-Generative/mishell
claude plugin install starter-dso-skills@mishell --scope local
```

```json
// OpenCode: opencode.json
{ "skills": { "urls": [
  "https://raw.githubusercontent.com/dnum-mi/starter-kit-opencode/<sha>/.agents/skills/dso/"
] } }
```

`<sha>`: the commit of `starter-dso-skills` in
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json). The folder must end with
`/`: OpenCode reads the group's `index.json` there.

### All the team's skills

`agent-skills` itself, with the `dev` and `repo` groups that `mishell-agent-skills` leaves out. It is a
plugin of its own marketplace, [`eric-skills`](https://github.com/IA-Generative/agent-skills), and it
follows `main`.

```bash
# Claude Code
claude plugin marketplace add IA-Generative/agent-skills
claude plugin install agent-skills@eric-skills --scope local
```

```json
// OpenCode: opencode.json ("groups" to choose; "#<sha>" after ".git" to pin)
{ "plugin": ["agent-skills@git+https://github.com/IA-Generative/agent-skills.git"] }
```

### Full DSO kit

The `dso` group of [`dnum-mi/starter-kit-opencode`](https://github.com/dnum-mi/starter-kit-opencode)
adds the instructions, the agents and the commands (`/deployer-cpin`). The `dev` group (`/livrer`,
front, back, monorepo) is chosen the same way. See the kit's README for the requirements.

```bash
# Claude Code
claude plugin marketplace add dnum-mi/starter-kit-opencode
claude plugin install dso@starter-kit
```

```json
// OpenCode: opencode.json
{ "plugin": [["starter-kit-opencode@git+https://github.com/dnum-mi/starter-kit-opencode.git",
              { "groups": ["dso"] }]] }
```

This kit follows `main` (OpenCode: `….git#<sha>` to pin; Claude Code: no pinning). Do not combine it
with `starter-dso-skills` or `mishell-more`: the DSO skills would be loaded twice.

### Sources without an OpenCode plugin

`etalab-ia/skills` (ANSSI guides, RGAA) does not publish an OpenCode plugin. To load exactly the source
of a bundle, clone the repository **at the pinned commit** and declare its skills folder:

```bash
git clone https://github.com/<repository>.git <folder> && git -C <folder> checkout <sha>
```

```json
// OpenCode: opencode.json (absolute path)
{ "skills": { "paths": ["<folder>/<skills path>"] } }
```

`<repository>`, `<sha>` and `<skills path>`: the `source` fields (`repo` or `url`, `sha`, `path`) and
`skills` of the plugin concerned in [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json).

## Update

A new version reaches you only after a change is merged in this repository (the sources are
[pinned](#pinning)).

### Claude Code

```bash
claude plugin marketplace update mishell                       # fetch the new catalogue
claude plugin update mishell-base@mishell --scope local        # same scope as at install
```

Restart Claude Code to apply. `claude plugin list` shows the version (commit) of each plugin and of
its dependencies.

### OpenCode

1. Edit `opencode.jsonc` from this repository, or move the `#<sha>` of your own `opencode.json` to the
   new commit of [`marketplace.json`](../.claude-plugin/marketplace.json).
2. A plugin that follows `main` (without `#<sha>`) is not refreshed by that alone: delete its folder
   in `~/.cache/opencode/packages/` (the one whose name starts with the plugin name).
3. For `skills.urls`, if a skill keeps its old content after the `<sha>` of the URL changed, delete
   its folder in `~/.cache/opencode/skills/`.
4. Restart OpenCode, then check with `opencode debug skill`.

## Uninstall

### Claude Code

```bash
claude plugin uninstall mishell-more@mishell --scope local --prune
claude plugin uninstall mishell-base@mishell --scope local --prune
claude plugin marketplace remove mishell                       # optional
```

- `--scope`: the one used at install (`user` if you did not pass one).
- `--prune` also removes the dependencies installed with the bundle (`fabnum-cicd-skills`, …);
  without it they stay.
- `marketplace remove` forgets the catalogue and its plugins on this machine. To use them again,
  run `marketplace add` and `install` again.

### OpenCode

1. Remove the entries from your `opencode.json`: the `plugin` entries, the `skills.urls` and the
   `skills.paths` that came from here.
2. Restart OpenCode. Nothing else is installed.
3. Optional clean-up: the downloaded copies in `~/.cache/opencode/packages/` and
   `~/.cache/opencode/skills/`, and the clone of `etalab-ia/skills` if you made one.

## Avoid duplicates

Each skill must be loaded only once:

- `mishell-agent-skills` (`mishell` marketplace) and the [`agent-skills`](#all-the-teams-skills) plugin (`eric-skills`
  marketplace) expose the same `audit`, `dat` and `mirai` skills: take only one. `mishell-agent-skills`
  is pinned to a commit; `agent-skills` follows `main` and adds the `dev` and `repo` groups.
- On Claude Code, the `dso@starter-kit` kit and `starter-dso-skills` / `mishell-more` cannot be combined.
- Do not install the same skills both as a plugin and by hand (copy or symbolic link) for one agent.

## Pinning

The sources of the bundles are **pinned by commit** (`sha` field of
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json)): nothing changes as long as
this repository does not change. The optional kits of this page ([all the team's skills](#all-the-teams-skills),
[the full DSO kit](#full-dso-kit)) follow `main` unless `#<sha>` is added, and are never part of a bundle.
