# PatternStore

Save and recall reusable **regex find/replace** pairs in VS Code.

## Features
- Save current Search (find/replace + flags) under a name
- Quick-pick to load into the Search panel
- Workspace or global storage
- Manage: rename / delete

## Commands
- `PatternStore: Save Pattern`
- `PatternStore: Load Pattern`
- `PatternStore: Manage Patterns`

## Settings
- `patternStore.savedPatterns`: global list
- `patternStore.workspacePatterns`: workspace list

## Keybinding (example)
Add to `keybindings.json`:
```json
{ "key": "ctrl+alt+r", "command": "patternStore.load" }
