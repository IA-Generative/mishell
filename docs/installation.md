# Installation

Le dépôt est **public** : aucune connexion GitHub n'est requise. `git` doit être installé.

| Agent | Voie |
|---|---|
| Claude Code | [marketplace `mishell`](#claude-code) |
| OpenCode | [plugins `agent-skills` et `starter-kit-opencode`](#opencode) |

Le même contenu se choisit sur les deux agents, par bundle ou par groupe :
[installation à la carte](#à-la-carte).

## Claude Code

```bash
claude plugin marketplace add IA-Generative/mishell
claude plugin install mishell-base@mishell     # socle Fabrique Numérique
claude plugin install mishell-more@mishell     # audit, homologation, ANSSI, RGAA, CPiN (facultatif)
```

- `marketplace add` n'enregistre que le catalogue : aucune skill n'est chargée avant `install`.
- Ensuite `/reload-plugins`, puis `claude plugin list` doit afficher le plugin `enabled`.
- `IA-Generative/mishell` est la source ; `mishell` est le nom de la marketplace.
- `--scope local` : ce projet seulement, sans modifier les fichiers versionnés (défaut `user` :
  toutes vos sessions ; `project` : partagé avec l'équipe via git).
- Mise à jour : `claude plugin marketplace update mishell`, puis `/reload-plugins`.

## OpenCode

OpenCode ne lit pas la marketplace `mishell` : il charge des **plugins** déclarés dans
`opencode.json` (celui du projet, ou `~/.config/opencode/opencode.json`). Deux plugins couvrent
nos skills ; prérequis : OpenCode ≥ 1.18, `git` et un accès à github.com. Testé avec OpenCode
1.18.35 : `opencode debug config` et `opencode debug skill` listent bien les skills attendues (pas
de session avec un modèle).

Le plus simple : copier [`opencode.jsonc`](../opencode.jsonc) (à la racine de ce dépôt) dans
l'`opencode.json` de votre projet. Il installe **`mishell-base`** par défaut, les deux sources
épinglées par commit, avec les compléments en commentaire et des permissions prêtes à adapter :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["fabnum-cicd@git+https://github.com/dnum-mi/fabnum-cicd.git#<sha>"],
  "skills": { "urls": ["https://raw.githubusercontent.com/dnum-mi/transversal-doc/<sha>/.agents/skills/"] }
}
```

`<sha>` : le commit de `fabnum-cicd-skills` (première ligne) et de `fabnum-transversal-skills`
(seconde) dans [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) (`opencode.jsonc`
les porte déjà ; un test vérifie qu'ils restent identiques). `transversal-doc` passe par `skills.urls`
et non par un plugin : son dépôt est un site de documentation, et le plugin ferait installer toutes ses
dépendances. Les compléments :

- **`agent-skills`** : les skills de l'équipe, par `groups` (`dev`, `audit`, `repo`, `dat`, `mirai` ;
  défaut : tous). `mishell-agent-skills` en est l'équivalent pour `audit`, `dat` et `mirai`.
- **`starter-kit-opencode`** : le kit Fabrique Numérique / Cloud Pi Native, par `groups` (`dev`,
  `dso`), avec instructions, agents et commandes : [le kit DSO complet](#le-kit-dso-complet).
- Le plugin est téléchargé par OpenCode dans son cache, rien n'est écrit dans le projet. Il
  **suit `main`** ; pour figer une version, ajouter `#<sha>` à l'URL (`….git#<sha>`).
- Mise à jour : supprimer le dossier du plugin dans `~/.cache/opencode/packages/`, puis relancer
  OpenCode. Relancer aussi après toute modification de `opencode.json`.
- Les noms de skills sont à plat sous OpenCode : ne pas charger la même skill par deux voies
  ([doublons](#éviter-les-doublons)).

Les règles de permissions `allow` / `ask` / `deny` d'[`opencode.jsonc`](../opencode.jsonc) sont à
adapter ; seul `etalab-ia/skills` (`mishell-more`) n'a pas de plugin OpenCode :
[sources sans plugin](#sources-sans-plugin-opencode).

## À la carte

Pour ne prendre qu'une famille de skills, par exemple **DSO / Cloud Pi Native**.

| Plugin Claude Code (marketplace `mishell`) | Contenu | OpenCode |
|---|---|---|
| `mishell-agent-skills` | 5 skills d'audit (ouverture d'un dépôt, pen-test, red-team, RAG, outils OpenWebUI), 2 skills DAT d'homologation (génération, rendu `.docx`), 2 skills MirAI | plugin `agent-skills`, `"groups": ["audit", "dat", "mirai"]` |
| `starter-dso-skills` | 3 skills DSO / Cloud Pi Native (CI/CD fabnum, chart Helm, déploiement) | [`skills.urls`](#skills-dso-seules) |
| `fabnum-cicd-skills`, `fabnum-transversal-skills` | les deux moitiés du socle `mishell-base` | plugin `fabnum-cicd` (`#<sha>`) et `skills.urls` pour `transversal-doc` |
| `etalab-anssi-guides`, `etalab-rgaa` | guides ANSSI ; référentiel RGAA | [sans plugin](#sources-sans-plugin-opencode) |

`mishell-base` et `mishell-more` regroupent ces plugins. Plusieurs se combinent, sous Claude Code
comme sous OpenCode (plusieurs entrées dans `plugin`, ou plusieurs `groups`).

### Skills DSO seules

Les trois skills du groupe `dso` de `starter-kit-opencode`, **épinglées sur un commit**, sans
instructions, agents ni commandes.

```bash
# Claude Code
claude plugin marketplace add IA-Generative/mishell
claude plugin install starter-dso-skills@mishell --scope local
```

```json
// OpenCode : opencode.json
{ "skills": { "urls": [
  "https://raw.githubusercontent.com/dnum-mi/starter-kit-opencode/<sha>/.agents/skills/dso/"
] } }
```

`<sha>` : le commit de `starter-dso-skills` dans
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json). Le dossier doit se terminer
par `/` : OpenCode y lit l'`index.json` du groupe.

### Le kit DSO complet

Le groupe `dso` de [`dnum-mi/starter-kit-opencode`](https://github.com/dnum-mi/starter-kit-opencode)
apporte en plus les instructions, les agents et les commandes (`/deployer-cpin`). Le groupe `dev`
(`/livrer`, front, back, monorepo) se choisit de la même façon. Voir le README du kit pour les prérequis.

```bash
# Claude Code
claude plugin marketplace add dnum-mi/starter-kit-opencode
claude plugin install dso@starter-kit
```

```json
// OpenCode : opencode.json
{ "plugin": [["starter-kit-opencode@git+https://github.com/dnum-mi/starter-kit-opencode.git",
              { "groups": ["dso"] }]] }
```

Ce kit suit `main` (OpenCode : `….git#<sha>` pour figer ; Claude Code : pas d'épinglage). Ne le
combinez pas avec `starter-dso-skills` ni `mishell-more` : les skills DSO seraient chargées deux fois.

### Sources sans plugin OpenCode

`etalab-ia/skills` (guides ANSSI, RGAA) ne publie pas de plugin OpenCode. Pour charger exactement
la source d'un bundle, cloner le dépôt **au commit épinglé** et déclarer son dossier de skills :

```bash
git clone https://github.com/<dépôt>.git <dossier> && git -C <dossier> checkout <sha>
```

```json
// OpenCode : opencode.json (chemin absolu)
{ "skills": { "paths": ["<dossier>/<chemin des skills>"] } }
```

`<dépôt>`, `<sha>` et `<chemin des skills>` : champs `source` (`repo` ou `url`, `sha`, `path`) et
`skills` du plugin concerné dans [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json).

## Éviter les doublons

Chaque skill ne doit être chargée qu'une fois :

- `mishell-agent-skills` (marketplace `mishell`) et le plugin `agent-skills` (marketplace `eric-skills`)
  exposent les mêmes skills `audit`, `dat` et `mirai` : en prendre un seul. `mishell-agent-skills` est
  épinglé sur un commit ; `agent-skills` suit `main` et ajoute les groupes `dev` et `repo`.
- Sous Claude Code, le kit `dso@starter-kit` et `starter-dso-skills` / `mishell-more` ne se combinent pas.
- Ne pas cumuler plugin et liens `install.sh` d'`agent-skills` pour un même agent.

## Épinglage

Les sources des bundles sont **épinglées par commit** (champ `sha` de
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json)) : rien ne change tant que
ce dépôt ne change pas. Les plugins OpenCode `agent-skills` et `starter-kit-opencode` suivent
`main` tant qu'on n'ajoute pas `#<sha>`.
