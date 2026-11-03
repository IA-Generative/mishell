# Instructions for an agent working on this repository

This repository contains **no skill and no script**: only `.claude-plugin/marketplace.json`
(Claude Code bundles), Markdown documentation, an `opencode.jsonc` (an example to copy, extras
commented out) and a test file (`tests/marketplace.test.mjs`). The skills live in
`IA-Generative/agent-skills` and in third-party repositories.

## Invariants

1. **Every external source is pinned by full `sha`.** Never a branch, never a tag.
2. **No install script, no hook** in this repository: that is the point.
3. **No secrets**, no sensitive internal URL, no person's name in an example.
4. **Delivery by PR.** Never commit directly on `main`: a bundle merged here reaches every machine
   at the next update.
5. The README is for humans and stays short; the detail goes in `docs/`. A piece of information
   lives in **one place only**.
6. **Claude Code and OpenCode are two equal installation agents.** Every installation command given
   for one is given for the other (`claude plugin …` / `opencode.json` block), or the docs say why
   there is no OpenCode equivalent. The detail lives in `docs/installation.md`; no "other agents"
   section and no link to `install.sh`. OpenCode does not read the marketplace: its plugins
   (`agent-skills`, `starter-kit-opencode`) are declared in `opencode.json`, with `groups` to choose
   (`#<sha>` to pin).
7. **Documentation and comments are written in English.** Skill names (`audit-repo-ouverture`, …)
   stay as published upstream.

## Before proposing a PR

```bash
claude plugin validate .
MISHELL_ONLINE=1 MISHELL_CLAUDE=1 node --test tests/*.test.mjs
git status --short
```

Without the variables, only the offline checks run (structure, full shas, dependencies).
`MISHELL_ONLINE` verifies that every `sha` exists upstream; `MISHELL_CLAUDE` installs the bundles in
an isolated Claude Code config (temporary `CLAUDE_CONFIG_DIR`, no login and no model call) and
checks the skills each plugin exposes.
