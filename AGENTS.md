# Instructions pour un agent travaillant sur ce dépôt

Ce dépôt ne contient **aucune skill ni aucun script** : seulement
`.claude-plugin/marketplace.json` (bundles Claude Code), de la documentation Markdown et un
fichier de test (`tests/marketplace.test.mjs`). Les skills vivent dans `IA-Generative/agent-skills`
et dans des dépôts tiers.

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
MISHELL_ONLINE=1 MISHELL_CLAUDE=1 node --test tests/*.test.mjs
git status --short
```

Sans les variables, seuls les contrôles hors ligne tournent (structure, sha complets,
dépendances). `MISHELL_ONLINE` vérifie que chaque `sha` existe en amont ; `MISHELL_CLAUDE`
installe les bundles dans une config Claude Code isolée (`CLAUDE_CONFIG_DIR` temporaire, ni login
ni appel modèle) et contrôle les skills exposées par chaque plugin.
