# PatternStore

Save and recall reusable **regex find/replace** pairs in VS Code.

##  Features

![alt text](<assets/manage-pattern-view.png> "Manage Patterns View")

**Load patterns** into Search panel with one keystroke

**Global & Workspace scopes** - Share or keep local

**Manage patterns** - Rename and delete via UI


## 🚀 Quick Start


### Load a Pattern (Fastest!)
1. Open the Manage Pattern Press `Ctrl+Alt+R`
2. Select a pattern
3. ✅ Search panel opens with your pattern!

### Create a Pattern Manually
1. Open Settings: `Ctrl+Shift+P` → "Open User Settings (JSON)"
2. Add to `patternStore.savedPatterns`:
```json
{
  "label": "TODO to FIXME",
  "find": "TODO",
  "replace": "FIXME",
  "flags": {
    "isRegex": false,
    "isCaseSensitive": true,
    "matchWholeWord": true,
    "isMultiline": false
  },
  "scope": "global"
}
```

## 📋 Commands
- `PatternStore: Manage Patterns` - Open view to load store update delete patterns (`Ctrl+Alt+R`)

## ⚙️ Settings
- `patternStore.savedPatterns` - Global patterns (all workspaces)
- `patternStore.workspacePatterns` - Workspace patterns (current project)

## 🎯 Example Patterns

See `example-settings.json` for ready-to-use patterns!

### Find-Only Pattern
```json
{
  "label": "Find all TODOs",
  "find": "TODO",
  "flags": { "isRegex": false, "isCaseSensitive": true, "matchWholeWord": true, "isMultiline": false },
  "scope": "global"
}
```

### Regex Replace
```json
{
  "label": "Import quotes to angles",
  "find": "\"([^\"]+)\"",
  "replace": "<$1>",
  "flags": { "isRegex": true, "isCaseSensitive": false, "matchWholeWord": false, "isMultiline": false },
  "scope": "global"
}
```

### Dynamic Pattern
```json
{
  "label": "Dynamic module import",
  "find": "\"${prompt:module}([^\"]*)\"",
  "replace": "<${prompt:module}$1>",
  "flags": { "isRegex": true, "isCaseSensitive": true, "matchWholeWord": false, "isMultiline": false },
  "scope": "global"
}
```

## 🎹 Keybindings

Default: `Ctrl+Alt+R` for Manage Pattern

Customize in `keybindings.json`:
```json
{ "key": "ctrl+alt+r", "command": "patternStore.manage" }
```

## 📚 Documentation

- `ROADMAP.md` - Planned features for next version
- `example-settings.json` - Example patterns to try


## 🤝 Contributing

Ideas and feedback welcome! See `ROADMAP.md` for planned features.

## 📄 License

See LICENSE file.
