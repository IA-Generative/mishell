# mishell

Bundles de skills de l'équipe IA-Generative pour les agents de code. Ce dépôt ne contient **aucune
skill** : il choisit lesquelles installer, chacune **épinglée par commit**, depuis
[`agent-skills`](https://github.com/IA-Generative/agent-skills) (nos skills) et des dépôts tiers.

Dépôt **public** : aucune connexion GitHub requise. Chaque étape s'ajoute à la précédente.
Les commandes sont données pour Claude Code et pour OpenCode.

## 1. Les indispensables : principes de travail

Quatre principes courts d'après un post de Karpathy (dépôt tiers, hors bundles) :

```bash
claude plugin marketplace add multica-ai/andrej-karpathy-skills
claude plugin install andrej-karpathy-skills@karpathy-skills --scope local
```

Facultatif, une méthode de développement complète (TDD, débogage, revue) — une seule des deux,
elles se recoupent : `mattpocock/skills` (à la carte) ou `obra/superpowers` (enchaînée).

```bash
claude plugin install mattpocock-skills@claude-plugins-official --scope local
# ou
claude plugin install superpowers@claude-plugins-official --scope local
```

Commandes OpenCode, commits revus, licences : [docs/sources-externes.md](docs/sources-externes.md).

## 2. Je démarre un projet : `mishell-base`

Le socle Fabrique Numérique : CI/CD, conventions, stack, API REST, déploiement.
Sous OpenCode : copier [opencode.jsonc](opencode.jsonc) dans votre `opencode.json` (`mishell-base` y est actif
par défaut ; détail dans [docs/installation.md](docs/installation.md#opencode)).

```bash
# Claude Code
claude plugin marketplace add IA-Generative/mishell
claude plugin install mishell-base@mishell --scope local
```

`--scope local` : ce projet seulement, sans modifier les fichiers versionnés (défaut `user` :
toutes vos sessions ; `project` : partagé avec l'équipe via git).

## 3. Le projet avance : `mishell-more`

Audits (pen-test, red-team, RAG), DAT d'homologation, MirAI, guides ANSSI, RGAA, skills DSO / Cloud Pi Native.

```bash
# Claude Code
claude plugin install mishell-more@mishell --scope local
```

```json
// OpenCode : opencode.json (audit, DAT, MirAI ; DSO, ANSSI, RGAA : voir docs/installation.md)
{ "plugin": [["agent-skills@git+https://github.com/IA-Generative/agent-skills.git",
              { "groups": ["audit", "dat", "mirai"] }]] }
```

Une seule famille, par exemple les skills DSO : [installation à la carte](docs/installation.md#à-la-carte).

## Contenu

| Bundle | Source | Skills |
|---|---|---|
| `mishell-base` | `dnum-mi/fabnum-cicd`, `dnum-mi/transversal-doc` | CI/CD, conventions, stack, API REST, déploiement |
| `mishell-more` | `agent-skills` (groupes `audit`, `dat`, `mirai`) | `audit-repo-ouverture`, `audit-pentest-prep`, `audit-redteam`, `audit-rag`, `audit-tool-owui`, `dat-generation`, `dat-word`, `mirai-check-service-names`, `mirai-smoke-test` |
| | `etalab-ia/skills`, `dnum-mi/starter-kit-opencode` | guides ANSSI, RGAA, DSO / Cloud Pi Native |

## Documentation

- [docs/installation.md](docs/installation.md) : installation par agent (Claude Code, OpenCode), à la carte
- [docs/sources-externes.md](docs/sources-externes.md) : méthodes de développement recommandées
- [CONTRIBUTING.md](CONTRIBUTING.md) : modifier un bundle, mettre à jour un pin
- [AGENTS.md](AGENTS.md) : invariants du dépôt
