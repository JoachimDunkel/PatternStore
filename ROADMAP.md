# PatternStore - Future Development Roadmap

## 🎯 MVP Features for Next Session

### 1. Manage Patterns Webview ⭐ HIGHEST PRIORITY

**Current State:**
- ✅ Load Pattern command works perfectly
- ⚠️ Old "Manage Patterns" only does rename/delete via QuickPick
- ❌ No UI for adding/editing patterns (users must edit JSON manually)

**New Solution: Native HTML Webview with VS Code Styling**

#### Why NOT Use the Official Webview UI Toolkit:
- ❌ **Deprecated as of January 2025** - No future updates, security risks
- ❌ **Based on FAST Foundation** - Also deprecated
- ✅ **Better Alternative:** Native HTML + CSS Variables + Codicons

#### Architecture Decision:
**Use standard HTML/CSS with:**
1. **VS Code CSS Variables** - Auto-updating theme support
2. **Codicons** - Same icons user sees everywhere in VS Code
3. **Custom components** - Full control, no deprecated dependencies
4. **~100 lines of CSS** - Small, maintainable, future-proof

#### Two New Commands (Replacing Old Manage):

**1. `PatternStore: Manage Patterns (User)` - Global patterns**
- Opens webview showing all global patterns
- Search/filter functionality
- Add/Edit/Delete patterns
- Saves to user settings.json

**2. `PatternStore: Manage Patterns (Workspace)` - Workspace patterns**
- Opens webview showing all workspace patterns
- Search/filter functionality
- Add/Edit/Delete patterns
- Saves to workspace settings.json

#### Webview UI Design:

#### Webview UI Design:

```
┌──────────────────────────────────────────────────────┐
│ Manage User Patterns                           [×]   │
├──────────────────────────────────────────────────────┤
│ 🔍 [Search patterns...                       ] ❌   │
├──────────────────────────────────────────────────────┤
│ ▼ Global Patterns (5)                               │
│   ┌────────────────────────────────────────────────┐│
│   │ • TODO to FIXME                   [Edit] [Del] ││
│   │ • Import quotes to angles         [Edit] [Del] ││
│   │ • Find console.log                [Edit] [Del] ││
│   └────────────────────────────────────────────────┘│
│                                                      │
│ ▼ Workspace Patterns (2)                            │
│   ┌────────────────────────────────────────────────┐│
│   │ • Project TODO finder             [Edit] [Del] ││
│   │ • Local naming convention         [Edit] [Del] ││
│   └────────────────────────────────────────────────┘│
│                                                      │
│                            [+ Add New Pattern]      │
└──────────────────────────────────────────────────────┘

WHEN EDITING/ADDING:
┌──────────────────────────────────────────────────────┐
│ Edit Pattern: TODO to FIXME                    [×]   │
├──────────────────────────────────────────────────────┤
│ Pattern Name *                                       │
│ [TODO to FIXME                                    ]  │
│                                                      │
│ Find Text *                                          │
│ ┌──────────────────────────────────────────────────┐│
│ │TODO                                              ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ Replace Text (optional)                              │
│ ┌──────────────────────────────────────────────────┐│
│ │FIXME                                             ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ Search Options (Icon Buttons)                        │
│ [$(regex)      ] [$(case-sensitive)] [$(whole-word)] │
│  Regex            Match Case          Whole Word     │
│                                                      │
│ Scope                                                │
│ ( ) Global      (•) Workspace                        │
│                                                      │
│ File Filters (optional)                              │
│ Include: [*.ts, *.tsx                             ]  │
│ Exclude: [node_modules/**, *.test.ts             ]  │
│                                                      │
│            [Save]  [Save & Load]  [Cancel]           │
└──────────────────────────────────────────────────────┘
```

#### Key Features:

**Pattern List Panel:**
- ✅ Search input with real-time filtering
- ✅ Two collapsible sections (Global/Workspace)
- ✅ Pattern count badges
- ✅ Edit and Delete buttons per pattern
- ✅ Add button to create new patterns
- ✅ Scrollable list (for many patterns)

**Pattern Editor Form:**
- ✅ All fields in single view (no multi-step wizard)
- ✅ Icon toggle buttons for flags (using Codicons)
- ✅ Radio buttons for scope selection
- ✅ Optional file filters (include/exclude)
- ✅ Two save options:
  - "Save" - Just save the pattern
  - "Save & Load" - Save and immediately open in search panel

#### UI Components to Build:

1. **Search Input Component**
   - Codicon search icon
   - Clear button (X) when text present
   - Real-time filter of pattern list

2. **Collapsible Section Component**
   - Chevron icon ($(chevron-down) / $(chevron-up))
   - Count badge
   - Smooth expand/collapse animation

3. **Pattern List Item Component**
   - Pattern name
   - Edit button ($(edit) icon)
   - Delete button ($(trash) icon)
   - Hover effects

4. **Icon Toggle Button Component**
   - Codicon icon
   - Label text
   - Active/inactive visual states
   - Toggle on click

5. **Text Input/Textarea Components**
   - Styled with VS Code CSS variables
   - Proper focus states
   - Validation indicators

#### CSS Architecture:

```
src/webview/
  styles/
    base.css                    ← Reset, VS Code variables, typography
    components/
      search-input.css          ← Search with clear button
      collapsible-section.css   ← Expandable sections
      pattern-list.css          ← List items with edit/delete
      pattern-form.css          ← Form layout and inputs
      icon-button.css           ← Toggle buttons for flags
      button.css                ← Action buttons (Save, Cancel, etc.)
    layout.css                  ← Grid/flexbox page layout
  
  components/
    PatternList.js              ← List rendering & filtering logic
    PatternForm.js              ← Form validation & state
    IconButton.js               ← Toggle button logic
    Collapsible.js              ← Section expand/collapse
  
  views/
    managePatterns.html         ← Main webview HTML
    managePatterns.js           ← Message handling & coordination
  
  WebviewManager.ts             ← Extension-side webview creation
```

#### VS Code Integration:

**CSS Variables (Auto-theming):**
```css
:root {
  /* Inputs */
  --vscode-input-background
  --vscode-input-foreground
  --vscode-input-border
  --vscode-input-placeholderForeground
  
  /* Buttons */
  --vscode-button-background
  --vscode-button-foreground
  --vscode-button-hoverBackground
  --vscode-button-secondaryBackground
  --vscode-button-secondaryForeground
  
  /* Lists */
  --vscode-list-activeSelectionBackground
  --vscode-list-activeSelectionForeground
  --vscode-list-hoverBackground
  --vscode-list-focusOutline
  
  /* Badges */
  --vscode-badge-background
  --vscode-badge-foreground
  
  /* Focus */
  --vscode-focusBorder
  
  /* Misc */
  --vscode-foreground
  --vscode-descriptionForeground
  --vscode-errorForeground
}
```

**Codicons:**
```html
<!-- Include in webview HTML -->
<link href="https://unpkg.com/@vscode/codicons/dist/codicon.css" rel="stylesheet">

<!-- Usage -->
<i class="codicon codicon-regex"></i>
<i class="codicon codicon-case-sensitive"></i>
<i class="codicon codicon-whole-word"></i>
<i class="codicon codicon-search"></i>
<i class="codicon codicon-close"></i>
<i class="codicon codicon-edit"></i>
<i class="codicon codicon-trash"></i>
<i class="codicon codicon-add"></i>
<i class="codicon codicon-chevron-down"></i>
<i class="codicon codicon-chevron-up"></i>
```

#### Message Protocol (Webview ↔ Extension):

**Webview → Extension:**
```typescript
// Request all patterns for a scope
{ type: 'requestPatterns', scope: 'global' | 'workspace' }

// Save new or updated pattern
{ type: 'savePattern', pattern: RegexPattern, scope: 'global' | 'workspace' }

// Delete pattern
{ type: 'deletePattern', label: string, scope: 'global' | 'workspace' }

// Save and immediately load into search
{ type: 'saveAndLoad', pattern: RegexPattern, scope: 'global' | 'workspace' }
```

**Extension → Webview:**
```typescript
// Send patterns to webview
{ type: 'patternsLoaded', patterns: RegexPattern[], scope: 'global' | 'workspace' }

// Confirm save success
{ type: 'patternSaved', success: true, label: string }

// Report errors
{ type: 'error', message: string }
```

#### Implementation Steps:

**Phase 1: Setup (15 min)**
1. Create directory structure
2. Set up base HTML template
3. Include Codicons and base CSS
4. Create WebviewManager.ts skeleton

**Phase 2: CSS Components (45 min)**
1. base.css - VS Code variables and reset
2. search-input.css - Search box with clear button
3. collapsible-section.css - Expandable sections
4. pattern-list.css - List items with buttons
5. pattern-form.css - Form layout
6. icon-button.css - Toggle buttons
7. button.css - Action buttons
8. layout.css - Page structure

**Phase 3: JavaScript Components (30 min)**
1. Search/filter logic
2. Collapsible section toggle
3. Pattern list rendering
4. Form validation
5. Icon button toggle states

**Phase 4: Message Handling (20 min)**
1. WebviewManager creation and disposal
2. Extension → Webview messages
3. Webview → Extension messages
4. Wire up to storage.ts functions

**Phase 5: Commands (10 min)**
1. Update package.json (remove old manage, add two new)
2. Register commands in extension.ts
3. Update keybindings if needed

**Phase 6: Testing (20 min)**
1. Test add pattern
2. Test edit pattern
3. Test delete pattern
4. Test search/filter
5. Test Save & Load
6. Test both scopes (global/workspace)
7. Test theme changes

**Total Time: ~2.5 hours**

---

### 2. File Scope Integration ⭐ INCLUDE IN MVP

**Decision: YES, include file filters in MVP**

**Why:**
- ✅ Small implementation cost (~15 minutes)
- ✅ High user value (common use case)
- ✅ Optional fields = backward compatible
- ✅ VS Code API already supports it
- ✅ Already designed in UI mockup above

#### Schema Change:

```typescript
export interface RegexPattern {
  label: string;
  find: string;
  replace?: string;
  flags: {
    isRegex: boolean;
    isCaseSensitive: boolean;
    matchWholeWord: boolean;
    isMultiline: boolean;
  };
  scope: "global" | "workspace";
  
  // NEW OPTIONAL FIELDS:
  filesToInclude?: string;  // e.g., "*.ts, *.tsx" or "src/**"
  filesToExclude?: string;  // e.g., "node_modules/**, *.test.ts"
}
```

#### Implementation:

**1. Update types.ts** (2 min)
```typescript
export interface RegexPattern {
  // ... existing fields ...
  filesToInclude?: string;
  filesToExclude?: string;
}
```

**2. Update searchCtx.ts** (3 min)
```typescript
await vscode.commands.executeCommand('workbench.action.findInFiles', {
  query: resolvedFind,
  replace: resolvedReplace,
  isRegex: pattern.flags.isRegex,
  isCaseSensitive: pattern.flags.isCaseSensitive,
  matchWholeWord: pattern.flags.matchWholeWord,
  preserveCase: false,
  triggerSearch: true,
  
  // Add these:
  filesToInclude: pattern.filesToInclude,
  filesToExclude: pattern.filesToExclude,
});
```

**3. Update package.json schema** (5 min)
```json
{
  "properties": {
    "patternStore.savedPatterns": {
      "items": {
        "properties": {
          // ... existing properties ...
          "filesToInclude": {
            "type": "string",
            "description": "File patterns to include (e.g., '*.ts, *.tsx')"
          },
          "filesToExclude": {
            "type": "string",
            "description": "File patterns to exclude (e.g., 'node_modules/**')"
          }
        }
      }
    }
  }
}
```

**4. Add to webview form** (5 min)
- Already designed in UI mockup
- Two text inputs in form
- Optional, can be left blank

**Total: 15 minutes** ✅

#### Example Patterns:

```json
{
  "label": "TODOs in TypeScript only",
  "find": "TODO",
  "filesToInclude": "*.ts, *.tsx",
  "filesToExclude": "*.test.ts, *.spec.ts"
}
```

```json
{
  "label": "C++ includes in headers",
  "find": "#include \"([^\"]+)\"",
  "replace": "#include <$1>",
  ## 📊 MVP Definition

### ✅ Must Have (MVP):

1. **Manage Patterns Webview**
   - Two commands: Manage (User) and Manage (Workspace)
   - Pattern list with search/filter
   - Add/Edit/Delete patterns
   - Save and Save & Load options
   - Native HTML + CSS variables + Codicons

2. **File Scope Filters**
   - filesToInclude optional field
   - filesToExclude optional field
   - Integration with VS Code search

3. **Load Pattern Command**
   - Already working ✅
   - Keep as-is

4. **Storage System**
   - Already working ✅
   - Supports global and workspace scopes

5. **Placeholder System**
   - Already working ✅
   - ${prompt:name} with single prompt per unique name

### ⚠️ Nice to Have (Not MVP):

1. Auto-detect multiline from find text
2. Pattern categories/tags
3. Import/export patterns
4. Pattern history/statistics
5. Pattern validation/preview
6. Keyboard shortcuts per pattern

---

## 🎯 Implementation Priority Order

### Session 1: Core Webview (2.5 hours)
1. ✅ Setup webview structure
2. ✅ Build CSS components
3. ✅ Implement JavaScript logic
4. ✅ Message handling
5. ✅ Update commands
6. ✅ Testing

### Session 2: File Filters (15 minutes)
1. ✅ Update types.ts
2. ✅ Update searchCtx.ts
3. ✅ Update package.json schema
4. ✅ Testing with file patterns

### Session 3: Polish (1 hour)
1. ✅ Update documentation
2. ✅ Add example patterns with file filters
3. ✅ Create demo video/screenshots
4. ✅ Test all workflows end-to-end

**Total MVP Time: ~4 hours**

---

## 🏗️ Technical Architecture

### Webview Stack:
- **HTML5** - Semantic, accessible markup
- **CSS3** - Modern layout (Grid, Flexbox)
- **Vanilla JavaScript** - No frameworks (lightweight)
- **VS Code CSS Variables** - Auto-theming
- **Codicons** - Icon consistency
- **Message API** - Webview ↔ Extension communication

### Why No Framework?
- ✅ Simpler, less code
- ✅ No build step for webview
- ✅ Faster load time
- ✅ Easier to debug
- ✅ No dependency updates needed
- ✅ VS Code examples use vanilla JS

### File Structure:
```
PatternStore/
├── src/
│   ├── extension.ts          ← Command registration
│   ├── storage.ts             ← Settings.json read/write ✅
│   ├── searchCtx.ts           ← Search integration ✅
│   ├── types.ts               ← Interfaces (update for file filters)
│   └── webview/
│       ├── WebviewManager.ts  ← Create/manage webview panels
│       ├── styles/
│       │   ├── base.css
│       │   ├── layout.css
│       │   └── components/
│       │       ├── search-input.css
│       │       ├── collapsible-section.css
│       │       ├── pattern-list.css
│       │       ├── pattern-form.css
│       │       ├── icon-button.css
│       │       └── button.css
│       ├── components/
│       │   ├── PatternList.js
│       │   ├── PatternForm.js
│       │   ├── IconButton.js
│       │   └── Collapsible.js
│       └── views/
│           ├── managePatterns.html
│           └── managePatterns.js
├── package.json               ← Update commands
├── tsconfig.json              ← Already configured ✅
└── README.md                  ← Update with new features
```

---

## 📝 Documentation Updates Needed

### Files to Update:
1. **README.md**
   - Update features list
   - Add screenshots of webview
   - Update commands section
   - Remove "not yet implemented" warnings

2. **QUICK_REFERENCE.md**
   - Add Manage (User) command
   - Add Manage (Workspace) command
   - Document file filter syntax

3. **IMPLEMENTATION_STATUS.md**
   - Mark Manage Webview as complete
   - Mark File Filters as complete
   - Update "What Works" section

4. **TESTING.md**
   - Add webview testing steps
   - Add file filter test cases

5. **example-settings.json**
   - Add patterns with filesToInclude/Exclude
   - Show real-world examples

6. **VISUAL_GUIDE.md**
   - Add webview screenshots
   - Show filter workflow

---

## 🧪 Testing Checklist

### Webview Tests:
- [ ] Open Manage (User) - shows global patterns
- [ ] Open Manage (Workspace) - shows workspace patterns
- [ ] Search/filter patterns - real-time filtering works
- [ ] Add new pattern - saves correctly
- [ ] Edit existing pattern - updates correctly
- [ ] Delete pattern - removes from settings
- [ ] Save & Load - saves and opens in search
- [ ] Collapsible sections - expand/collapse works
- [ ] Icon buttons - toggle active/inactive states
- [ ] Theme change - colors update automatically
- [ ] Validation - required fields enforced

### File Filter Tests:
- [ ] Pattern with filesToInclude - searches only those files
- [ ] Pattern with filesToExclude - skips those files
- [ ] Pattern with both - respects both filters
- [ ] Pattern with neither - searches all files (backward compat)
- [ ] Complex patterns - "src/**/*.ts" works
- [ ] Multiple patterns - "*.ts, *.tsx" works

### Integration Tests:
- [ ] Load pattern with filters - applies to search
- [ ] Placeholder + filters - both work together
- [ ] Global override workspace - correct precedence
- [ ] Rename pattern - updates correctly
- [ ] Duplicate name - validation prevents

---

## 💡 Design Decisions

### Why Separate User/Workspace Commands?
- ✅ Clear mental model (which settings file am I editing?)
- ✅ Prevents accidental saves to wrong scope
- ✅ Can show scope-specific UI hints
- ✅ Matches VS Code's settings UI paradigm

### Why Single Webview (Not Separate Add/Edit)?
- ✅ Less code duplication
- ✅ Consistent UI/UX
- ✅ Easier to maintain
- ✅ Pattern list + form in same view = better workflow

### Why Icon Buttons for Flags?
- ✅ More compact than checkboxes with labels
- ✅ Icons match VS Code search panel exactly
- ✅ Visual consistency across VS Code
- ✅ User recognizes icons immediately

### Why Include File Filters in MVP?
- ✅ Differentiates from simple find/replace bookmarks
- ✅ Common use case (language-specific patterns)
- ✅ Small implementation cost
- ✅ High user value

### Why No Framework for Webview?
- ✅ Simpler = fewer bugs
- ✅ Faster = better UX
- ✅ No build complexity
- ✅ Easier for contributors
- ✅ Matches VS Code extension guidelines

---

## 🚀 Success Criteria

### MVP is Complete When:
1. ✅ Users can add patterns via UI (no JSON editing)
2. ✅ Users can edit existing patterns
3. ✅ Users can delete patterns
4. ✅ Users can search/filter pattern list
5. ✅ Patterns can specify file scope (include/exclude)
6. ✅ UI matches VS Code design language
7. ✅ UI auto-updates with theme changes
8. ✅ All existing features still work (load, placeholders)
9. ✅ Documentation is updated
10. ✅ All tests pass

### Quality Bar:
- **Performance:** Webview opens in < 200ms
- **Accessibility:** All controls keyboard-navigable
- **Theme Support:** Works in light/dark/high-contrast
- **Error Handling:** User-friendly error messages
- **Validation:** Prevents invalid patterns
- **UX:** No more than 3 clicks to add a pattern

---

## 📚 Resources

### VS Code APIs:
- [Webview API Guide](https://code.visualstudio.com/api/extension-guides/webview)
- [Webview UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/webviews)
- [Configuration API](https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration)

### Design Resources:
- [Codicons Gallery](https://microsoft.github.io/vscode-codicons/dist/codicon.html)
- [VS Code CSS Variables](https://code.visualstudio.com/api/references/theme-color)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

### Examples:
- [Webview Sample Extensions](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-sample)
- [VS Code Settings UI](https://github.com/microsoft/vscode/tree/main/src/vs/workbench/contrib/preferences) (for inspiration)

---

## 🎉 Post-MVP Vision

Once MVP is complete, PatternStore will be:
- ✅ **Fully functional** - No manual JSON editing required
- ✅ **User-friendly** - Intuitive UI matching VS Code design
- ✅ **Powerful** - Placeholders + file filters + scopes
- ✅ **Future-proof** - No deprecated dependencies
- ✅ **Extensible** - Clear architecture for future features

**Future possibilities:**
- Pattern marketplace/sharing
- AI-powered pattern suggestions
- Integration with Git (patterns per branch)
- Team pattern synchronization
- Pattern analytics and insights
}
```

```json
{
  "label": "Find in source only",
  "find": "console\\.log",
  "filesToInclude": "src/**",
  "filesToExclude": "src/**/*.test.js"
}
```

---

### 3. Auto-detect Multiline ⭐ NICE TO HAVE

**Current State:**
- Pattern interface has `isMultiline` flag
- User must set it manually

**Proposal:**
- Auto-detect from find text (contains `\n`)
- Or remove flag entirely (not needed for search?)

**Investigation Needed:**
- Does VS Code search panel use multiline flag?
- Or is it inferred from regex pattern?

**Decision: DEFER** - Not critical for MVP, investigate later

---

## 🔮 Future Enhancements (Post-MVP)

### Pattern Categories/Tags
- Organize patterns into categories
- Filter by category
- Icons per category

### Import/Export Patterns
- Export patterns to JSON file
- Import patterns from file
- Share pattern collections

### Pattern History
- Track pattern usage
- Show recently used patterns
- Usage statistics

### Pattern Variables/Snippets
- Beyond ${prompt:name}
- Date/time variables: ${date}, ${time}
- Project variables: ${workspace}, ${file}
- Custom transformations

### Search Results Integration
- Show pattern in search results view
- Quick-apply pattern from results
- Pattern suggestions based on context

### Pattern Validation
- Validate regex syntax
- Test pattern against sample text
- Show match preview

### Keyboard Shortcuts
- Assign shortcuts to specific patterns
- Quick-load favorite patterns
- Shortcut picker UI

---

## 📊 MVP Definition

### ✅ Must Have (MVP):
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
