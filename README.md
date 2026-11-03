# mishell

Skill bundles from the IA-Generative team for coding agents, for both
[Claude Code](https://claude.com/claude-code) and [OpenCode](https://opencode.ai). This repository
contains **no skill**: it chooses which ones to install, each **pinned to a commit**, from
[`agent-skills`](https://github.com/IA-Generative/agent-skills) (our skills) and from third-party
repositories.

The repository is **public**: no GitHub login is required. Each step builds on the previous one; open
the one you need.

<details>
<summary><b>1. The essentials: working principles</b></summary>

&nbsp;

Four short principles based on a post by Karpathy ([third-party repository](https://github.com/multica-ai/andrej-karpathy-skills), outside the bundles):

```bash
# Claude Code
claude plugin marketplace add multica-ai/andrej-karpathy-skills
claude plugin install andrej-karpathy-skills@karpathy-skills --scope local
```

Optional: a complete development method (TDD, debugging, review). Take only one of the two, they
overlap: [`mattpocock/skills`](https://github.com/mattpocock/skills) (pick and choose) or
[`obra/superpowers`](https://github.com/obra/superpowers) (chained).

```bash
# Claude Code
claude plugin install mattpocock-skills@claude-plugins-official --scope local
# or
claude plugin install superpowers@claude-plugins-official --scope local
```

OpenCode commands, reviewed commits and licences: [docs/external-sources.md](docs/external-sources.md).

</details>

<details open>
<summary><b>2. Starting a project: <code>mishell-base</code></b></summary>

&nbsp;

The Fabrique Numérique foundation: CI/CD, conventions, stack, REST API, deployment.

```bash
# Claude Code
claude plugin marketplace add IA-Generative/mishell
claude plugin install mishell-base@mishell --scope local
```

**OpenCode**: copy [opencode.jsonc](opencode.jsonc) into your `opencode.json`. `mishell-base` is
enabled there by default; details in [docs/installation.md](docs/installation.md#opencode).

`--scope local` means this project only, without changing any versioned file (default `user`: all
your sessions; `project`: shared with the team through git).

</details>

<details>
<summary><b>3. The project grows: <code>mishell-more</code></b></summary>

&nbsp;

Audits (pen-test, red-team, RAG), DAT security accreditation files, MirAI, ANSSI guides, RGAA,
DSO / Cloud Pi Native skills.

```bash
# Claude Code
claude plugin install mishell-more@mishell --scope local
```

```json
// OpenCode: opencode.json (audit, DAT, MirAI; DSO, ANSSI, RGAA: see docs/installation.md)
// <sha>: the mishell-agent-skills commit in .claude-plugin/marketplace.json
{ "plugin": [["agent-skills@git+https://github.com/IA-Generative/agent-skills.git#<sha>",
              { "groups": ["audit", "dat", "mirai"] }]] }
```

Only one family, for example the DSO skills: [pick and choose](docs/installation.md#pick-and-choose).

</details>

<details>
<summary><b>What is in each bundle</b></summary>

&nbsp;

| Bundle | Source | Skills |
|---|---|---|
| `mishell-base` | [`dnum-mi/fabnum-cicd`](https://github.com/dnum-mi/fabnum-cicd), [`dnum-mi/transversal-doc`](https://github.com/dnum-mi/transversal-doc) | CI/CD, conventions, stack, REST API, deployment |
| `mishell-more` | [`IA-Generative/agent-skills`](https://github.com/IA-Generative/agent-skills) (groups `audit`, `dat`, `mirai`) | `audit-repo-ouverture`, `audit-pentest-prep`, `audit-redteam`, `audit-rag`, `audit-tool-owui`, `dat-generation`, `dat-word`, `mirai-check-service-names`, `mirai-smoke-test` |
| | [`etalab-ia/skills`](https://github.com/etalab-ia/skills), [`dnum-mi/starter-kit-opencode`](https://github.com/dnum-mi/starter-kit-opencode) | ANSSI guides, RGAA, DSO / Cloud Pi Native |

</details>

## Documentation

- [docs/installation.md](docs/installation.md): installation per agent (Claude Code, OpenCode), pick and choose
- [docs/external-sources.md](docs/external-sources.md): recommended development methods
- [CONTRIBUTING.md](CONTRIBUTING.md): change a bundle, update a pin
- [AGENTS.md](AGENTS.md): repository invariants
