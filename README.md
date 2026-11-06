# mishell

Skill bundles from the IA-Generative team for coding agents, for both
[Claude Code](https://claude.com/claude-code) and [OpenCode](https://opencode.ai). This repository
contains **no skill**: it chooses which ones to install, each **pinned to a commit**, from the
repositories listed in [What is in each bundle](#what-is-in-each-bundle).

The repository is **public**: no GitHub login is required.

## Install

Each step builds on the previous one. Open the one you need.

### 1. The essentials: working principles

Four short principles based on a post by Karpathy
([third-party repository](https://github.com/multica-ai/andrej-karpathy-skills), outside the bundles).

<details>
<summary>Commands</summary>

&nbsp;

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

### 2. Starting a project: `mishell-base`

The Fabrique Numérique foundation: CI/CD, conventions, stack, REST API, deployment.

![Demo: from an intention to a running app with mishell-base and OpenCode](docs/assets/mishell-base-demo.gif)

<details open>
<summary>Commands</summary>

&nbsp;

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

### 3. The project grows: `mishell-more`

Audits (pen-test, red-team, RAG), DAT security accreditation files, MirAI, DSO / Cloud Pi Native,
ANSSI guides, RGAA.

<details>
<summary>Commands</summary>

&nbsp;

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

## What is in each bundle

<table>
  <thead>
    <tr><th>Bundle</th><th>Repository</th><th>Skills</th></tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2"><code>mishell-base</code></td>
      <td><a href="https://github.com/dnum-mi/fabnum-cicd"><code>dnum-mi/fabnum-cicd</code></a></td>
      <td>
        <ul>
          <li><code>fabnum-cicd-pipeline</code>: <code>ci.yml</code> and <code>cd.yml</code></li>
          <li><code>fabnum-cicd-release</code>: release-please, Conventional Commits</li>
          <li><code>fabnum-cicd-git-hooks</code>: local git hooks</li>
          <li><code>fabnum-cicd-helm</code>: Helm charts</li>
          <li><code>fabnum-cicd-auth</code>: GitHub credentials</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/dnum-mi/transversal-doc"><code>dnum-mi/transversal-doc</code></a></td>
      <td>
        <ul>
          <li><code>fabnum-conventions</code>: entry point</li>
          <li><code>fabnum-code-style</code>, <code>fabnum-project-structure</code>, <code>fabnum-project-docs</code></li>
          <li><code>fabnum-stack</code>, <code>fabnum-server</code>, <code>fabnum-client</code>, <code>fabnum-rest-api</code></li>
          <li><code>fabnum-cicd</code>, <code>fabnum-deployment</code>, <code>fabnum-poc-to-prod</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td rowspan="3"><code>mishell-more</code></td>
      <td><a href="https://github.com/IA-Generative/agent-skills"><code>IA-Generative/agent-skills</code></a><br>(groups <code>audit</code>, <code>dat</code>, <code>mirai</code>)</td>
      <td>
        <ul>
          <li>Audit: <code>audit-repo-ouverture</code>, <code>audit-pentest-prep</code>, <code>audit-redteam</code>, <code>audit-rag</code>, <code>audit-tool-owui</code></li>
          <li>DAT: <code>dat-generation</code>, <code>dat-word</code></li>
          <li>MirAI: <code>mirai-check-service-names</code>, <code>mirai-smoke-test</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/dnum-mi/starter-kit-opencode"><code>dnum-mi/starter-kit-opencode</code></a><br>(group <code>dso</code>)</td>
      <td>
        <ul>
          <li><code>cicd-fabnum</code>: fabnum CI/CD</li>
          <li><code>helm-chart-cpin</code>: Helm chart for Cloud Pi Native</li>
          <li><code>deploiement-cpin</code>: deployment on Cloud Pi Native</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/etalab-ia/skills"><code>etalab-ia/skills</code></a></td>
      <td>
        <ul>
          <li><code>anssi-guides</code>: ANSSI guides</li>
          <li><code>rgaa</code>: RGAA accessibility reference</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## Documentation

- [docs/installation.md](docs/installation.md): installation per agent (Claude Code, OpenCode), pick and choose
- [docs/external-sources.md](docs/external-sources.md): recommended development methods
- [CONTRIBUTING.md](CONTRIBUTING.md): change a bundle, update a pin
- [AGENTS.md](AGENTS.md): repository invariants
