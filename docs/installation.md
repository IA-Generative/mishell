# Installation

Le dépôt est **interne** à l'organisation GitHub IA-Generative : il faut en être membre et
connecté (`gh auth login`).

## Claude Code

```bash
claude plugin marketplace add IA-Generative/mishell
claude plugin install mishell-base@mishell     # socle Fabrique Numérique
claude plugin install mishell-more@mishell     # sécurité, homologation, CPiN (facultatif)
claude plugin install mishell-skills@mishell   # toutes les skills d'agent-skills (facultatif)
```

- `marketplace add` n'enregistre que le catalogue : aucune skill n'est chargée avant `install`.
- Ensuite `/reload-plugins`, puis `claude plugin list` doit afficher le plugin `enabled`.
- `IA-Generative/mishell` est la source ; `mishell` est le nom de la marketplace.
- Mise à jour : `claude plugin marketplace update mishell`, puis `/reload-plugins`.
- Les sources tierces sont **épinglées par commit** (champ `sha` de
  [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json)) : rien ne change
  tant que ce dépôt ne change pas.

## Autres agents

Ce dépôt ne livre que des bundles Claude Code. Pour Codex, Gemini CLI, Cursor, Copilot, Kimi,
Deep Code ou OpenCode, les skills de l'équipe s'installent depuis
[`agent-skills`](https://github.com/IA-Generative/agent-skills/blob/main/docs/installation.md)
(`install.sh`, plugin OpenCode). Les sources tierces des bundles s'installent depuis leur
propre dépôt.

## Un seul canal

Avec le plugin **et** les liens d'`agent-skills` (`install.sh`), chaque skill apparaît deux fois
sous Claude Code : choisir l'un ou l'autre.
