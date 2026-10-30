# Contribuer

Ce dépôt ne contient pas de skill : une skill se propose dans
[`agent-skills`](https://github.com/IA-Generative/agent-skills/blob/main/CONTRIBUTING.md). Ici
on modifie la **composition des bundles** ([`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)).

| Vous voulez… | Faites |
|---|---|
| signaler un bundle cassé, une skill qui ne se charge pas | une issue, avec la commande tapée et la sortie de `claude plugin list` |
| ajouter ou retirer une source dans un bundle | une PR (ci-dessous) |
| mettre à jour une source (nouvelle version amont) | une PR qui change le `sha` |

## Proposer une PR

1. Branche dédiée, jamais de commit sur `main`.
2. **Épingler par `sha` complet (40 caractères)**, jamais par branche ni tag mutable. Le `sha`
   doit exister sur le dépôt amont (sinon l'installation échoue).
3. Avant d'ajouter une source tierce : lire tout son `SKILL.md`, vérifier qu'il ne lance rien
   d'externe à l'installation, noter sa licence dans [docs/sources-externes.md](docs/sources-externes.md).
4. Dans la PR : ce qui change dans le bundle, et le commit amont revu.
5. Vérifier :
   ```bash
   claude plugin validate .
   ```

## Mettre à jour le pin d'agent-skills

Les plugins `mishell-skills`, `mishell-audit` et `mishell-dat` pointent vers un commit
d'`agent-skills`. Après une fusion qui ajoute ou modifie une skill là-bas, repointer le `sha`
vers le nouveau commit de `main` de ce dépôt.
