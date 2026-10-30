# Sources tierces recommandées

Méthodes de développement de base, citées dans le README, hors des bundles. Revues le 2026-10-30.

| Dépôt | Commit | Licence | Contenu |
|---|---|---|---|
| `mattpocock/skills` | `a496f55` | MIT | skills à la carte : TDD, diagnostic de bug, revue, `grilling`, modélisation du domaine… |
| `obra/superpowers` | `2ce8aa1` | MIT | méthode complète : brainstorming, plan, TDD, débogage systématique, revue, vérification |
| `multica-ai/andrej-karpathy-skills` | `2c60614` | aucune détectée | une skill, `karpathy-guidelines` : quatre principes d'après un post de Karpathy (le dépôt n'est pas de lui) |

- `mattpocock/skills` et `superpowers` se recoupent : en prendre une seule.
- Recoupements avec nos skills : `bug-investigate` (débogage), `repo-perimetre` (esprit « simplicité d'abord,
  changement chirurgical » des principes Karpathy), `controle-qualite-code` (revue). Les nôtres restent
  ciblées sur nos conventions (lecture seule, `private/`, neutralité vis-à-vis de l'agent).
- Karpathy, sans licence détectée : on recommande leur plugin, on ne recopie pas leur texte.

## Installation sous OpenCode

```bash
# Karpathy (commande de skills.sh, non documentée par le dépôt ; copie la skill dans le projet)
npx skills@latest add multica-ai/andrej-karpathy-skills -a opencode
# mattpocock/skills (copie dans le projet ; cocher setup-matt-pocock-skills)
npx skills@latest add mattpocock/skills -a opencode
```

```json
// superpowers : opencode.json (OpenCode 1.x ; clé "plugins" en 2.x)
{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }
```
