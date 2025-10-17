# PatternStore - Quick Reference

## 🎉 Current Working Features (v0.1.0)

### Commands
| Command | Shortcut | Description |
|---------|----------|-------------|
| **PatternStore: Load Pattern** | `Ctrl+Alt+R` | Load saved pattern into search |
| **PatternStore: Manage Patterns** | - | Rename or delete patterns |
| **PatternStore: Save Pattern** | - | ⚠️ Not implemented (use settings.json) |

### Keyboard Shortcuts
- `Ctrl+Alt+R` - Quick load pattern (fastest way!)
- `Ctrl+Shift+P` → Type "PatternStore" - All commands

### Toolbar Buttons
Open Search panel (`Ctrl+Shift+F`) to see:
- 📂 **Load Pattern** button
- 💾 **Save Pattern** button (not functional yet)

---

## 📝 How to Create Patterns Manually

### 1. Open Settings
- Press `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"

### 2. Add Pattern
```json
{
  "patternStore.savedPatterns": [
    {
      "label": "Your Pattern Name",
      "find": "search text or regex",
      "replace": "replacement text (optional)",
      "flags": {
        "isRegex": false,
        "isCaseSensitive": true,
        "matchWholeWord": false,
        "isMultiline": false
      },
      "scope": "global"
    }
  ]
}
```

### 3. Pattern Types

#### Find-Only Pattern (no replace)
```json
{
  "label": "Find all TODOs",
  "find": "TODO",
  "flags": {
    "isRegex": false,
    "isCaseSensitive": true,
    "matchWholeWord": true,
    "isMultiline": false
  },
  "scope": "global"
}
```

#### Simple Text Replace
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

#### Regex Pattern
```json
{
  "label": "Import quotes to angles",
  "find": "\"([^\"]+)\"",
  "replace": "<$1>",
  "flags": {
    "isRegex": true,
    "isCaseSensitive": false,
    "matchWholeWord": false,
    "isMultiline": false
  },
  "scope": "global"
}
```

#### Dynamic Pattern (with prompt)
```json
{
  "label": "Dynamic module import",
  "find": "\"${prompt:module}([^\"]*)\"",
  "replace": "<${prompt:module}$1>",
  "flags": {
    "isRegex": true,
    "isCaseSensitive": true,
    "matchWholeWord": false,
    "isMultiline": false
  },
  "scope": "global"
}
```

---

## 🚀 Usage Workflow

### Quick Pattern Load (Recommended)
1. `Ctrl+Alt+R`
2. Select pattern
3. ✅ Done! Search panel opens

### Using Search Panel
1. `Ctrl+Shift+F` (open Search)
2. Click 📂 icon
3. Select pattern
4. Review results
5. Click "Replace" or "Replace All"

### Managing Patterns
1. `Ctrl+Shift+P` → "PatternStore: Manage"
2. Select pattern to manage
3. Choose:
   - ✏️ Rename
   - 🗑️ Delete

---

## 💡 Tips & Tricks

### Placeholders
- Use `${prompt:name}` for dynamic values
- Same placeholder name = same value throughout pattern
- Example: `${prompt:module}` in find AND replace = same value

### Scopes
- **Global:** Available in all workspaces
- **Workspace:** Only in current project (saved to `.vscode/settings.json`)

### Regex Flags
- `isRegex: true` - Enable regex matching
- `isCaseSensitive: true` - Case-sensitive search
- `matchWholeWord: true` - Match complete words only
- `isMultiline: true` - `^` and `$` match line boundaries

### Replace Field
- **Optional** - Omit for find-only patterns
- **Empty string** - Use `""` to delete matches
- **Regex groups** - Use `$1`, `$2`, etc. for captured groups

---

## 🐛 Troubleshooting

### Pattern doesn't appear in list
- Check JSON syntax in settings
- Ensure pattern has required fields: `label`, `find`, `flags`, `scope`
- Reload VS Code window

### Regex not working
- Set `"isRegex": true` in flags
- Escape special characters: `\`, `(`, `)`, `[`, `]`, etc.

### Placeholder not prompting
- Check syntax: `${prompt:name}` (exact format)
- Don't escape the `$`: Use `"${prompt:...}"` NOT `"\\${prompt:...}"`

### Pattern loads but nothing found
- Check file type/scope
- Verify regex syntax
- Test pattern in VS Code search first

---

## 📂 Example Patterns Library

See `example-settings.json` for ready-to-use patterns:
- Import quotes to angles (C++)
- TODO to FIXME
- Dynamic module import
- Find all TODOs (no replace)

---

## 🎓 Next Steps

1. **Try the examples** - Load and test provided patterns
2. **Create your own** - Add patterns to settings.json
3. **Share patterns** - Export settings for team
4. **Read ROADMAP.md** - See upcoming features

---

**Enjoy PatternStore!** 🎉

For issues or questions, check:
- `TESTING.md` - Testing guide
- `ROADMAP.md` - Future features
- `IMPLEMENTATION_STATUS.md` - Current status
