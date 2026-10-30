# Instructions pour un agent travaillant sur ce dépôt

Ce dépôt ne contient **aucune skill ni aucun script** : seulement
`.claude-plugin/marketplace.json` (bundles Claude Code) et de la documentation Markdown. Les
skills vivent dans `IA-Generative/agent-skills` et dans des dépôts tiers.

## Invariants

1. **Toute source externe est épinglée par `sha` complet.** Jamais de branche, jamais de tag.
2. **Pas de script d'installation, pas de hook** dans ce dépôt : c'est le but.
3. **Pas de secrets**, aucune URL interne sensible, aucun nom de personne dans un exemple.
4. **Livraison par PR.** Jamais de commit direct sur `main` : un bundle fusionné ici se propage
   à toutes les machines à la prochaine mise à jour.
5. Le README s'adresse aux humains et reste court ; le détail va dans `docs/`. Une information
   vit à **un seul endroit**.

## Avant de proposer une PR

```bash
claude plugin validate .
git status --short
```
