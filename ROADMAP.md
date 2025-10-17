# PatternStore - Future Development Roadmap

## 🎯 Priority Features for Next Session

### 1. Save Pattern UI - Standalone Dialog ⭐ HIGH PRIORITY

**Current Limitation:**
- Cannot read search panel state via VS Code API
- Save command exists but doesn't work properly

**Solution: Custom Webview Dialog**
Create a standalone dialog window with proper UI for creating/editing patterns.

#### Requirements:
- **Webview-based dialog** (not sequential input prompts)
- **All fields in one view:**
  - ✏️ Pattern Name (text input)
  - 🔍 Find text (multiline textarea)
  - 🔄 Replace text (multiline textarea, optional)
  - ⚙️ Flags (checkboxes):
    - ☑️ Use Regular Expression
    - ☑️ Match Case
    - ☑️ Match Whole Word
    - ☑️ Multiline
  - 🌍 Scope (radio buttons):
    - ⚪ Global (all workspaces)
    - ⚪ Workspace (current project only)
  - 📁 Files to include (text input, optional)
  - 🚫 Files to exclude (text input, optional)

#### Smart Pre-filling:
1. **If text is selected in editor:**
   - Pre-fill Find field with selection
   - Focus on Replace field

2. **If nothing selected:**
   - All fields empty
   - Focus on Find field

3. **For editing existing pattern:**
   - Load all values from pattern
   - Allow modification

#### Dialog Actions:
- **[Save]** button - Save pattern to settings
- **[Save & Load]** button - Save and immediately load into search
- **[Cancel]** button - Close without saving

#### Technical Notes:
```typescript
// Use VS Code Webview API
vscode.window.createWebviewPanel({
  viewType: 'patternStore.editPattern',
  title: 'Create/Edit Pattern',
  // HTML/CSS/JS for form
});
```

---

### 2. Search Scope Integration - Files to Include/Exclude ⭐ MEDIUM PRIORITY

**Feature:**
Allow patterns to specify which files to search in.

#### Pattern Schema Extension:
```typescript
export interface RegexPattern {
  label: string;
  find: string;
  replace?: string;
  flags: { ... };
  scope: "global" | "workspace";
  
  // NEW FIELDS:
  filesToInclude?: string;  // e.g., "*.ts, *.js" or "src/**/*.cpp"
  filesToExclude?: string;  // e.g., "node_modules, *.test.ts"
}
```

#### Behavior:
- **If `filesToInclude` is empty/undefined:** Skip (use current VS Code search scope)
- **If `filesToInclude` is set:** Pass to `findInFiles` command
- **If `filesToExclude` is set:** Pass to `findInFiles` command

#### Example Patterns:
```json
{
  "label": "Find TODOs in TypeScript files only",
  "find": "TODO",
  "filesToInclude": "*.ts, *.tsx",
  "filesToExclude": "*.test.ts, *.spec.ts"
}
```

```json
{
  "label": "C++ header includes",
  "find": "#include \"([^\"]+)\"",
  "replace": "#include <$1>",
  "filesToInclude": "*.cpp, *.h, *.hpp",
  "filesToExclude": "build/**, test/**"
}
```

#### Implementation:
```typescript
// In searchCtx.ts loadPatternIntoSearch()
const commandArgs: any = {
  query: find,
  replace: replace,
  // ... existing flags ...
  
  // Add file scope if specified
  ...(pattern.filesToInclude && { 
    filesToInclude: pattern.filesToInclude 
  }),
  ...(pattern.filesToExclude && { 
    filesToExclude: pattern.filesToExclude 
  })
};
```

---

## 📋 Additional Enhancements (Lower Priority)

### 3. Pattern Categories/Tags
- Add optional `category` or `tags` field
- Group patterns in QuickPick by category
- Examples: "Refactoring", "C++", "Documentation", "Cleanup"

### 4. Pattern Import/Export
- Export all patterns to JSON file
- Import patterns from JSON file
- Share pattern collections with team

### 5. Pattern History
- Track recently used patterns
- Show "Recently Used" section in QuickPick
- Quick access with `Ctrl+Alt+R` → first item = last used

### 6. Pattern Editing from QuickPick
- In "Manage Patterns", add "Edit" option (not just Rename/Delete)
- Opens the webview dialog with pattern pre-filled
- Quick way to modify existing patterns

### 7. Context Menu Integration
- Right-click in editor → "Save Selection as Pattern"
- Right-click in search results → "Save Search as Pattern"

### 8. Pattern Validation
- Validate regex syntax when saving
- Show error if regex is invalid
- Suggest fixes or show regex explanation

---

## 🛠️ Technical Implementation Notes

### Webview Dialog Structure
```
src/
  ├── webview/
  │   ├── editPattern.html    // Dialog HTML
  │   ├── editPattern.css     // Styling
  │   ├── editPattern.js      // Client-side logic
  │   └── WebviewManager.ts   // VS Code side handler
  ├── extension.ts
  ├── storage.ts
  ├── searchCtx.ts
  └── types.ts
```

### Message Passing (Webview ↔ Extension)
```typescript
// From webview to extension
webview.postMessage({
  command: 'savePattern',
  pattern: { label, find, replace, flags, ... }
});

// From extension to webview
webview.postMessage({
  command: 'loadPattern',
  pattern: existingPattern
});
```

### VS Code findInFiles API Reference
Check available parameters:
```typescript
vscode.commands.executeCommand("workbench.action.findInFiles", {
  query: string,
  replace?: string,
  triggerSearch?: boolean,
  isRegex?: boolean,
  isCaseSensitive?: boolean,
  matchWholeWord?: boolean,
  preserveCase?: boolean,
  filesToInclude?: string,
  filesToExclude?: string,
  // Investigate other possible parameters
});
```

---

## 🎯 Next Session Action Plan

### Phase 1: Preparation (5 min)
1. Research VS Code Webview API
2. Check available `findInFiles` parameters for file scope
3. Review existing Save Pattern command structure

### Phase 2: Webview Dialog (30-45 min)
1. Create `src/webview/` directory structure
2. Build HTML form with all fields
3. Add CSS styling (match VS Code theme)
4. Implement message passing
5. Connect to Save Pattern command

### Phase 3: File Scope Integration (15-20 min)
1. Update `RegexPattern` interface
2. Modify `loadPatternIntoSearch()` to pass file scope
3. Update JSON schema in `package.json`
4. Test with example patterns

### Phase 4: Testing (10 min)
1. Test creating patterns via webview
2. Test file scope filtering
3. Verify settings.json updates correctly

---

## 📝 Current Status Summary

### ✅ What's Working:
- Load patterns into search panel
- Placeholder resolution (`${prompt:name}`)
- Global and workspace scopes
- Rename/delete patterns
- Optional replace field
- Keybindings and toolbar buttons

### ⚠️ What's Not Implemented:
- Save Pattern command (needs webview dialog)
- File scope (include/exclude files)
- Pattern editing UI
- Categories/tags
- Import/export

### 🎉 Code Quality:
- Clean TypeScript architecture
- Well-organized modules
- No compilation errors
- Good separation of concerns

---

## 💡 Ideas for Advanced Features (Future)

1. **Pattern Snippets:** Use snippets in find/replace fields
2. **Multi-cursor Support:** Apply pattern to multiple selections
3. **Dry Run Mode:** Preview replacements before applying
4. **Pattern Marketplace:** Share patterns with community
5. **AI-Assisted Patterns:** Generate patterns from natural language
6. **Pattern Testing:** Test patterns against sample text
7. **Regex Visualization:** Show regex explanation/diagram
8. **Batch Operations:** Apply multiple patterns in sequence

---

## 🚀 Quick Start for Next Session

```bash
# 1. Open project
cd /home/dunkel3/git/privat/PatternStore

# 2. Review this roadmap
cat ROADMAP.md

# 3. Start with webview implementation
mkdir -p src/webview
code src/webview/editPattern.html

# 4. Test as you go
npm run compile
# Press F5 to test
```

---

**Great work so far! The foundation is solid and ready for these enhancements.** 🎊
