# Contributing

This repository contains no skill: a skill is proposed in
[`agent-skills`](https://github.com/IA-Generative/agent-skills/blob/main/CONTRIBUTING.md). Here we
change the **composition of the bundles** ([`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)).

| You want to… | Do |
|---|---|
| report a broken bundle or a skill that does not load | open an issue, with the command you typed and the output of `claude plugin list` |
| add or remove a source in a bundle | a PR (below) |
| update a source (new upstream version) | a PR that changes the `sha` |

## Propose a PR

1. Use a dedicated branch, never commit on `main`.
2. **Pin by full `sha` (40 characters)**, never by a mutable branch or tag. The `sha` must exist on the
   upstream repository (otherwise the installation fails).
3. Before adding a third-party source: read its whole `SKILL.md`, check that it runs nothing external
   at install time, and record its licence in [docs/external-sources.md](docs/external-sources.md).
4. In the PR: what changes in the bundle, and the upstream commit you reviewed.
5. Check:
   ```bash
   claude plugin validate .
   MISHELL_ONLINE=1 MISHELL_CLAUDE=1 node --test tests/*.test.mjs
   ```
   The second check verifies that every `sha` exists upstream and that the bundles install
   (temporary Claude Code config, without touching yours).

## Update the agent-skills pin

The `mishell-agent-skills` plugin points to a commit of `agent-skills`. After a merge that adds or
changes a skill there, point the `sha` to the new commit of that repository's `main`.
