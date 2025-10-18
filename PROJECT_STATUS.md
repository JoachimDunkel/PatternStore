# PatternStore - Project Status

## 🎯 Current State

**Version:** 0.1.0 (MVP in progress)  
**Status:** Core features working, webview UI next  
**Last Updated:** October 18, 2025

---

## ✅ What's Working

### Implemented Features:
1. ✅ **Load Pattern** (`Ctrl+Alt+R`) - Loads patterns into VS Code search panel
2. ✅ **Manage Patterns** - Rename and delete via QuickPick UI
3. ✅ **Storage System** - Read/write settings.json (global & workspace)
4. ✅ **Placeholder System** - `${prompt:name}` with single prompt per unique name
5. ✅ **Keybindings** - `Ctrl+Alt+R` for quick load
6. ✅ **Toolbar Integration** - Load button in search panel
7. ✅ **Dual Scopes** - Global and workspace pattern storage

### Commands:
- ✅ `PatternStore: Load Pattern` - Fully functional
- ⚠️ `PatternStore: Manage Patterns` - Rename/delete only (no add/edit UI)
- ❌ `PatternStore: Save Pattern` - Placeholder only (not implemented)

---

## 🚧 What's Not Working

### Missing Features:
1. ❌ **Add Pattern UI** - Must edit settings.json manually
2. ❌ **Edit Pattern UI** - Must edit settings.json manually
3. ❌ **File Scope Filters** - `filesToInclude`/`filesToExclude` not yet added
4. ❌ **Webview Manager** - Not yet created

### Known Limitations:
- Cannot read current search panel state (VS Code API limitation)
- Must manually create patterns in JSON format
- No visual pattern editor yet

---

## 📁 Architecture

### File Structure:
```
src/
├── extension.ts         ← Command registration, activation
├── storage.ts           ← Settings.json read/write (✅ complete)
├── searchCtx.ts         ← Search integration (✅ complete)
└── types.ts             ← TypeScript interfaces

Future:
src/webview/
├── WebviewManager.ts    ← Webview creation/management
├── views/
│   ├── managePatterns.html
│   └── managePatterns.js
└── styles/
    ├── base.css
    └── layout.css
```

### Module Dependencies:
```
extension.ts
    ├─ storage.ts         (pattern CRUD)
    ├─ searchCtx.ts       (load into search)
    └─ types.ts           (RegexPattern interface)

storage.ts
    └─ VS Code Configuration API

searchCtx.ts
    └─ workbench.action.findInFiles command
```

---

## 🔄 Data Flow

### Load Pattern:
```
User: Ctrl+Alt+R
    ↓
storage.getAllPatterns()
    ├─ Read global patterns (settings.json)
    ├─ Read workspace patterns (workspace settings.json)
    └─ Merge (workspace overrides global)
    ↓
Show QuickPick
    ↓
User selects pattern
    ↓
searchCtx.loadPatternIntoSearch()
    ├─ resolvePlaceholdersMultiple() → Prompt once per unique ${prompt:name}
    └─ executeCommand('workbench.action.findInFiles', {...})
    ↓
✅ Search panel opens with pattern
```

### Manage Pattern:
```
User: Command Palette → "Manage Patterns"
    ↓
storage.getAllPatterns()
    ↓
Show QuickPick (select pattern)
    ↓
Show QuickPick (Rename/Delete)
    ↓
storage.renamePattern() or storage.deletePattern()
    ↓
Update settings.json
    ↓
✅ Pattern updated
```

---

## 🎯 Next Steps (MVP)

### Priority 1: Webview UI (2.5 hours)
1. Add file filter fields to `RegexPattern` interface
2. Create webview structure (HTML/CSS/JS)
3. Build pattern list with search/filter
4. Build pattern editor form
5. Create `WebviewManager.ts`
6. Add two new commands:
   - `PatternStore: Manage Patterns (User)`
   - `PatternStore: Manage Patterns (Workspace)`

### Priority 2: File Filters (15 minutes)
1. Add `filesToInclude?: string` to types
2. Add `filesToExclude?: string` to types
3. Pass to `findInFiles` command
4. Update package.json schema

**Total MVP Time:** ~3 hours

---

## 📊 Technology Stack

### Current:
- **TypeScript** 5.3.0
- **VS Code API** 1.85.0+
- **Node.js** 20.x
- **Storage:** VS Code settings.json

### Planned (Webview):
- **HTML5** - Semantic markup
- **CSS3** - VS Code CSS variables (auto-theming)
- **Vanilla JavaScript** - No frameworks
- **Codicons** - VS Code icon font
- **NO** Webview UI Toolkit (deprecated Jan 2025)

---

## 🧪 Testing Status

### Tested & Working:
- ✅ Load simple patterns
- ✅ Load regex patterns
- ✅ Load patterns with placeholders
- ✅ Placeholder prompts (single per unique name)
- ✅ Rename patterns
- ✅ Delete patterns
- ✅ Global scope
- ✅ Workspace scope
- ✅ Workspace overrides global
- ✅ Keybinding (`Ctrl+Alt+R`)
- ✅ Toolbar button

### Not Yet Tested:
- ⏳ File scope filters (not implemented)
- ⏳ Webview UI (not implemented)
- ⏳ Add pattern via UI (not implemented)
- ⏳ Edit pattern via UI (not implemented)

---

## 📈 Code Statistics

**Total Lines:** ~490 TypeScript
- `extension.ts`: ~226 lines
- `storage.ts`: ~150 lines
- `searchCtx.ts`: ~80 lines
- `types.ts`: ~20 lines

**Test Workspace:** 4 example files (C++, Python, JavaScript, README)

---

## 🎓 Key Learnings

### What Works Well:
- ✅ VS Code Configuration API for storage
- ✅ `workbench.action.findInFiles` for search integration
- ✅ Placeholder system with regex extraction
- ✅ QuickPick UI for simple interactions

### What Doesn't Work:
- ❌ Cannot read current search panel state (API limitation)
- ❌ Sequential input boxes = poor UX (need webview)
- ❌ Webview UI Toolkit = deprecated (use native HTML)

### Architecture Decisions:
- ✅ Use native HTML + CSS Variables (not deprecated toolkit)
- ✅ Icon buttons for flags (match VS Code search panel)
- ✅ Separate User/Workspace commands (clear scope)
- ✅ Include file filters in MVP (small effort, high value)

---

## 🚀 Success Criteria (MVP)

MVP is complete when:
- ✅ Users can load patterns via UI (already working!)
- ⏳ Users can add patterns via UI (webview needed)
- ⏳ Users can edit patterns via UI (webview needed)
- ✅ Users can delete patterns via UI (already working!)
- ⏳ Users can search/filter patterns (webview needed)
- ⏳ Patterns support file filters (15 min to add)
- ⏳ UI matches VS Code design (webview needed)
- ✅ Placeholders work (already working!)
- ✅ Documentation complete (already complete!)

**Current Progress:** 40% complete (4/9 criteria met)

---

## 📚 References

- Original Specs: See `project-specs.md`
- Implementation Plan: See `ROADMAP.md`
- User Guide: See `README.md`
- Command Reference: See `QUICK_REFERENCE.md`
