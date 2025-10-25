# PatternStore

Save and recall reusable **regex find/replace** pairs in VS Code.

## ✨ Features
- ✅ **Load patterns** into Search panel with one keystroke
- ✅ **Dynamic placeholders** - Use `${prompt:name}` for runtime values
- ✅ **Global & Workspace scopes** - Share or keep local
- ✅ **Manage patterns** - Rename and delete via UI
- ✅ **Optional replace** - Find-only patterns supported
- ⚠️ **Save patterns** - Currently manual (via settings.json)

## 🚀 Quick Start

### Load a Pattern (Fastest!)
1. Press `Ctrl+Alt+R`
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
- `PatternStore: Load Pattern` - Load into search (`Ctrl+Alt+R`)
- `PatternStore: Manage Patterns` - Rename/delete patterns
- `PatternStore: Save Pattern` - ⚠️ Not yet implemented

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

Default: `Ctrl+Alt+R` for Load Pattern

Customize in `keybindings.json`:
```json
{ "key": "ctrl+alt+r", "command": "patternStore.manage" }
```

## 📚 Documentation

- `QUICK_REFERENCE.md` - Commands and usage guide
- `ROADMAP.md` - Planned features for next version
- `TESTING.md` - Testing instructions
- `example-settings.json` - Example patterns to try

## 🔮 Coming Soon

- 🎨 **Webview dialog** for creating patterns (no more manual JSON!)
- 📁 **File scope filters** - Include/exclude files in search
- 🏷️ **Pattern categories** - Organize your patterns
- 💾 **Import/Export** - Share pattern collections

See `ROADMAP.md` for details!

## 💡 Tips

- Use `${prompt:name}` for values you enter at runtime
- Omit `replace` field for find-only patterns
- Create workspace patterns for project-specific searches
- Use regex groups (`$1`, `$2`) in replacements

## 🤝 Contributing

Ideas and feedback welcome! See `ROADMAP.md` for planned features.

## 📄 License

See LICENSE file.
