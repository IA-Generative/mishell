# Recommended third-party sources

Basic development methods, mentioned in the README, outside the bundles. Reviewed on 2026-10-30.

| Repository | Commit | Licence | Content |
|---|---|---|---|
| `mattpocock/skills` | `a496f55` | MIT | pick-and-choose skills: TDD, bug diagnosis, review, `grilling`, domain modelling… |
| `obra/superpowers` | `2ce8aa1` | MIT | complete method: brainstorming, plan, TDD, systematic debugging, review, verification |
| `multica-ai/andrej-karpathy-skills` | `2c60614` | none detected | one skill, `karpathy-guidelines`: four principles based on a post by Karpathy (the repository is not his) |

- `mattpocock/skills` and `superpowers` overlap: take only one.
- Overlaps with our skills: `bug-investigate` (debugging), `repo-perimetre` (the "simplicity first,
  surgical change" spirit of the Karpathy principles), `controle-qualite-code` (review). Ours stay
  focused on our conventions (read-only, `private/`, neutrality towards the agent).
- Karpathy, no licence detected: we recommend their plugin and do not copy their text.

## Installation with OpenCode

```bash
# Karpathy (skills.sh command, not documented by the repository; copies the skill into the project)
npx skills@latest add multica-ai/andrej-karpathy-skills -a opencode
# mattpocock/skills (copies into the project; tick setup-matt-pocock-skills)
npx skills@latest add mattpocock/skills -a opencode
```

```json
// superpowers: opencode.json (OpenCode 1.x; the key is "plugins" in 2.x)
{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }
```
