# PatternStore - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VS Code Extension                         │
│                         PatternStore                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          User Interface                          │
├─────────────────────────────────────────────────────────────────┤
│  • Command Palette                                               │
│    - PatternStore: Load Pattern        (Ctrl+Alt+R)             │
│    - PatternStore: Manage Patterns                              │
│    - PatternStore: Save Pattern        (not implemented)        │
│                                                                  │
│  • Toolbar Buttons (Search View)                                │
│    - 📂 Load Pattern                                            │
│    - 💾 Save Pattern                   (not implemented)        │
│                                                                  │
│  • QuickPick Lists                                              │
│    - Pattern selection                                          │
│    - Manage actions (Rename/Delete)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Core Extension Logic                        │
│                      (src/extension.ts)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  activate()                                                      │
│  ├─ Register Commands                                           │
│  ├─ patternStore.load      → loadPatternCommand()              │
│  ├─ patternStore.manage    → managePatternsCommand()           │
│  └─ patternStore.save      → savePatternCommand()              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Storage Module  │  │  Search Module   │  │   Types Module   │
│ (src/storage.ts) │  │(src/searchCtx.ts)│  │ (src/types.ts)   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│                  │  │                  │  │                  │
│ getAllPatterns() │  │ loadPattern      │  │ RegexPattern     │
│      ↓↑          │  │   IntoSearch()   │  │  interface:      │
│ savePattern()    │  │      │           │  │  - label         │
│      ↓↑          │  │      ▼           │  │  - find          │
│ deletePattern()  │  │ resolvePlacehol  │  │  - replace?      │
│      ↓↑          │  │   dersMultiple() │  │  - flags{}       │
│ renamePattern()  │  │      │           │  │  - scope         │
│      ↓↑          │  │      ▼           │  │                  │
│ patternExists()  │  │ findInFiles API  │  │                  │
│                  │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                      │
        ▼                      ▼
┌──────────────────┐  ┌──────────────────────────────────────────┐
│  VS Code Config  │  │       VS Code Search Panel               │
│   settings.json  │  │  workbench.action.findInFiles command    │
├──────────────────┤  ├──────────────────────────────────────────┤
│                  │  │                                          │
│ Global Settings: │  │  Parameters:                             │
│  patternStore.   │  │  - query (find text)                     │
│   savedPatterns  │  │  - replace (replace text)                │
│                  │  │  - isRegex                               │
│ Workspace:       │  │  - isCaseSensitive                       │
│  patternStore.   │  │  - matchWholeWord                        │
│   workspace      │  │  - preserveCase                          │
│   Patterns       │  │  - triggerSearch                         │
│                  │  │                                          │
└──────────────────┘  └──────────────────────────────────────────┘
```

## Data Flow

### 1. Load Pattern Flow
```
User presses Ctrl+Alt+R
        ↓
extension.ts: loadPatternCommand()
        ↓
storage.ts: getAllPatterns()
        ↓
        ├─ Read from settings.json (global)
        ├─ Read from settings.json (workspace)
        └─ Merge patterns
        ↓
Show QuickPick to user
        ↓
User selects pattern
        ↓
searchCtx.ts: loadPatternIntoSearch(pattern)
        ↓
        ├─ resolvePlaceholdersMultiple([find, replace])
        │       ↓
        │   Extract all ${prompt:name} placeholders
        │       ↓
        │   Prompt user ONCE per unique name
        │       ↓
        │   Replace in both find and replace strings
        │
        ↓
vscode.commands.executeCommand("workbench.action.findInFiles", {
    query: resolved_find,
    replace: resolved_replace,
    isRegex: pattern.flags.isRegex,
    ...
})
        ↓
✅ Search panel opens with pattern loaded!
```

### 2. Manage Pattern Flow
```
User: Ctrl+Shift+P → "PatternStore: Manage"
        ↓
extension.ts: managePatternsCommand()
        ↓
storage.ts: getAllPatterns()
        ↓
Show QuickPick with all patterns
        ↓
User selects pattern
        ↓
Show action QuickPick (Rename/Delete)
        ↓
User selects action
        ↓
If Rename:
    ├─ Prompt for new name
    └─ storage.ts: renamePattern()
            ↓
        Update settings.json
            ↓
        ✅ Pattern renamed!

If Delete:
    ├─ Show confirmation
    └─ storage.ts: deletePattern()
            ↓
        Update settings.json
            ↓
        ✅ Pattern deleted!
```

### 3. Storage Layer
```
settings.json
    ↓
VS Code Configuration API
    ↓
vscode.workspace.getConfiguration('patternStore')
    ↓
    ├─ .inspect('savedPatterns').globalValue
    ├─ .inspect('workspacePatterns').workspaceValue
    └─ .update(key, value, ConfigurationTarget)
    ↓
storage.ts module
    ↓
extension.ts commands
```

## Module Dependencies

```
extension.ts
    ├─ import * as storage from './storage'
    ├─ import * as searchCtx from './searchCtx'
    └─ import { RegexPattern } from './types'

storage.ts
    ├─ import * as vscode from 'vscode'
    └─ import { RegexPattern } from './types'

searchCtx.ts
    ├─ import * as vscode from 'vscode'
    └─ import { RegexPattern } from './types'

types.ts
    └─ (no imports - pure interfaces)
```

## Future Architecture (Next Session)

```
┌─────────────────────────────────────────────────────────────────┐
│                      NEW: Webview Dialog                         │
│                  (Save Pattern Interface)                        │
├─────────────────────────────────────────────────────────────────┤
│  HTML Form:                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Pattern Name:    [___________________________]             │ │
│  │ Find:           [___________________________]             │ │
│  │ Replace:        [___________________________] (optional)    │ │
│  │ ☑ Regex  ☑ Case  ☐ Whole Word  ☐ Multiline              │ │
│  │ Scope: ⚪ Global  ⚪ Workspace                            │ │
│  │ Files Include:  [___________________________] (optional)    │ │
│  │ Files Exclude:  [___________________________] (optional)    │ │
│  │ [Save] [Save & Load] [Cancel]                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼
        Message Passing
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEW: src/webview/WebviewManager.ts                  │
├─────────────────────────────────────────────────────────────────┤
│  - Handle webview creation                                       │
│  - Process messages from webview                                 │
│  - Call storage.savePattern()                                    │
│  - Optionally call searchCtx.loadPatternIntoSearch()            │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### ✅ What We Did Right

1. **Modular Architecture**
   - Separate concerns (storage, search, UI)
   - Easy to test and maintain
   - Clear dependencies

2. **Settings-Based Storage**
   - Native VS Code integration
   - No external dependencies
   - User can edit directly in JSON

3. **Placeholder System**
   - Flexible and powerful
   - Single prompt per unique name
   - Works across find and replace

4. **Optional Replace**
   - Supports find-only patterns
   - Cleaner UI when not needed

### 🎯 Future Improvements

1. **Webview for Save Pattern**
   - Better UX than manual JSON
   - Form validation
   - Visual feedback

2. **File Scope Filters**
   - Include/exclude files
   - More targeted searches

3. **Pattern Categories**
   - Organize large collections
   - Quick filtering

## Performance Considerations

- ✅ Minimal memory footprint (settings.json only)
- ✅ Fast pattern loading (no async I/O)
- ✅ Efficient placeholder resolution (one pass)
- ✅ No background processes

## Security

- ✅ No network access
- ✅ No external dependencies
- ✅ Sandboxed execution
- ✅ User-controlled data only

---

**This architecture is solid and ready for enhancements!** 🎉
