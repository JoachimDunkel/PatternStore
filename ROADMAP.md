# PatternStore - Development Roadmap & Implementation Guide

## 🚀 Quick Start (Next Session)

**Status:** Phase 1 complete ✅, Phase 2 in progress 🚧

**What's Done:**
1. ✅ File Filters - Added to types, search integration, schema (tested & working)
2. ✅ Webview Shell - Basic HTML structure created

**What's Next:**
1. 🚧 Pattern List UI - Collapsible sections, inline actions
2. ❌ Pattern Details Form - Auto-save editing
3. ❌ Search/Filter - Fuzzy pattern matching

**Before you continue:**
1. Read `PROJECT_STATUS.md` - Current implementation state
2. Read this file - Updated UI design below
3. Compile: `npm run compile`
4. Test: `F5` → Run "PatternStore: Manage Patterns"

---

## 🎨 Updated UI Design (October 18, 2025)

### Design Decisions Made:

**✅ Confirmed:**
- Single "Manage Patterns" command (not separate User/Workspace commands)
- Show ALL patterns (both scopes) in one view
- Collapsible sections by scope (not filter toggles)
- Auto-save on change (no explicit save button)
- Inline action buttons on each pattern
- Fuzzy search filtering

**❌ Rejected:**
- Separate commands for User/Workspace (too complex)
- Filter toggle buttons (collapsibles better)
- Explicit Save/Revert buttons (overengineered)
- Complex dirty state tracking (unnecessary)

### Webview Layout:

```
┌────────────────────────────────────────────────────────────────┐
│                    Manage Patterns                       [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─ PATTERN LIST ──────────────┬─ PATTERN DETAILS ──────────┐ │
│  │                              │                             │ │
│  │ [ ] | 🔍 Search...          │  Pattern Name               │ │
│  │                              │  [Console Logger          ] │ │
│  ├──────────────────────────────┤                             │ │
│  │                              │  Find                       │ │
│  │ ▼ Workspace (3)              │  ┌────────────────────────┐│ │
│  │   Pattern 1        [🗑️][📋] │  │console\.log            ││ │
│  │   Pattern 2        [🗑️][📋] │  └────────────────────────┘│ │
│  │   Pattern 3        [🗑️][📋] │                             │ │
│  │                              │  ▶ Replace (optional)       │ │
│  │ ▼ User (2)                   │                             │ │
│  │   Pattern 4        [🗑️][📋] │  Flags                      │ │
│  │   Pattern 5        [🗑️][📋] │  [.*] [Aa] [|word|]        │ │
│  │                              │                             │ │
│  │                              │  Files to Include           │ │
│  │                              │  [*.ts,*.js             ]   │ │
│  │                              │                             │ │
│  │                              │  Files to Exclude           │ │
│  │                              │  [node_modules/**       ]   │ │
│  │                              │                             │ │
│  │                              │  Scope: Workspace           │ │
│  │                              │                             │ │
│  │                              │        [Load to Search]     │ │
│  └──────────────────────────────┴─────────────────────────────┘ │
│                                                                │
│  Resizable divider between panels                             │
└────────────────────────────────────────────────────────────────┘
```

### Pattern List States:

**Normal Mode:**
```
┌──────────────────────────────────┐
│ 🔍 Search patterns...           │
├──────────────────────────────────┤
│ ▼ Workspace (3)                  │ ← Collapsible section
│   Pattern 1          [🗑️][📋]   │ ← Inline actions
│   Pattern 2          [🗑️][📋]   │
│   Pattern 3          [🗑️][📋]   │
│                                  │
│ ▼ User (2)                       │
│   Pattern 4          [🗑️][📋]   │
│   Pattern 5          [🗑️][📋]   │
└──────────────────────────────────┘
```

### UI Behavior:

**Pattern List:**
- Click pattern name → Show in details panel (right side)
- Click [🗑️] → Confirm and delete individual pattern
- Click [📋] → Load pattern to search and close webview
- Click ▶/▼ → Expand/collapse section
- Type in search → Filter patterns (fuzzy match), auto-expand matching sections

**Pattern Details:**
- Edit any field → Auto-saves after debounce (500ms)
- Click "Load to Search" → Load current pattern and close webview
- Collapsible "Replace" section → Click ▶ to expand if needed
- Icon buttons for flags → Toggle on/off (visual feedback)
- Scope dropdown → Change between Workspace/User

**Collapsible Sections:**
- Show pattern count: `Workspace (3)`
- Remember collapsed/expanded state
- Search auto-expands sections with matches

---

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

---

## 📋 Updated Implementation Plan

### Phase 3: Pattern List with Collapsible Sections

**Chunk 3.1: Load and Display Patterns** (15 min)
- Load patterns from storage (both global and workspace)
- Send to webview via postMessage
- Group patterns by scope
- Render basic list with section headers
- Show pattern count: `Workspace (3)`, `User (2)`

**Chunk 3.2: Collapsible Sections** (15 min)
- Add chevron icons (▶/▼) using Codicons
- Click to expand/collapse sections
- Remember state in localStorage
- Smooth CSS transitions

**Chunk 3.3: Inline Action Buttons** (15 min)
- Add [🗑️] delete icon to each pattern
  - Click → Confirm dialog → Delete → Refresh list
- Add [📋] load icon to each pattern
  - Click → Load pattern to search → Close webview

**Chunk 3.4: Search/Filter** (15 min)
- Implement search input functionality
- Filter patterns by substring match (case-insensitive)
- Auto-expand sections with matches
- Hide empty sections
- Show "No patterns found" if no matches

**Total Phase 3:** ~60 minutes

---

### Phase 4: Pattern Details Panel

**Chunk 4.1: Resizable Panels** (10 min)
- Add draggable divider between list and details
- CSS resize or JavaScript drag handler
- Save panel sizes to localStorage

**Chunk 4.2: Display Pattern Details** (15 min)
- Click pattern → Populate details form
- Show all fields (name, find, replace, flags, filters)
- Show scope as badge or dropdown

**Chunk 4.3: Collapsible Replace Section** (10 min)
- Replace field hidden by default
- Add ▶ "Replace (optional)" toggle
- Expand/collapse with animation

**Chunk 4.4: Icon-Based Flag Buttons** (15 min)
- Replace checkboxes with icon toggle buttons
- Use Codicons: `$(regex)`, `$(case-sensitive)`, `$(whole-word)`
- Visual active/inactive states
- Match VS Code search panel style

**Chunk 4.5: Auto-Save on Change** (15 min)
- Add debounced onChange handlers (500ms)
- Save to storage automatically
- Show subtle "Saving..." indicator
- Refresh pattern list if name changed

**Chunk 4.6: Load to Search Button** (10 min)
- Add "Load to Search" button in details panel
- Call existing loadPatternIntoSearch() function
- Close webview after loading

**Total Phase 4:** ~75 minutes

---

### Phase 5: Polish & Edge Cases

**Chunk 5.1: Empty States** (5 min)
- "No patterns yet" when list empty
- "No patterns found" when search has no matches
- "Select a pattern" placeholder in details panel

**Chunk 5.2: Validation** (10 min)
- Pattern name required (disable save if empty)
- Find text required
- Show validation errors inline

**Chunk 5.3: Keyboard Navigation** (10 min)
- Arrow keys to navigate pattern list
- Enter to select pattern
- Delete key to delete selected
- Escape to close webview

**Chunk 5.4: Confirmation Dialogs** (5 min)
- Delete single: "Delete 'Pattern Name'?"
- Delete multiple: "Delete 3 patterns?"
- Use VS Code native dialogs

**Total Phase 5:** ~30 minutes

---

## ⏱️ Total Estimated Time

- ✅ Phase 1 (File Filters): ~20 minutes - **COMPLETE**
- ✅ Phase 2 (Webview Shell): ~10 minutes - **COMPLETE**
- 🚧 Phase 3 (Pattern List): ~80 minutes - **NEXT**
- ❌ Phase 4 (Details Panel): ~75 minutes
- ❌ Phase 5 (Polish): ~30 minutes

**Remaining:** ~3 hours

---

## 🎯 MVP Features for Next Session

### 1. Manage Patterns Webview ⭐ HIGHEST PRIORITY

**Current State:**
- ✅ File filters added and working
- ✅ Webview shell created
- ✅ Basic HTML structure in place
- 🚧 Pattern list needs implementation
- ❌ Details panel not functional yet

**New Solution: Native HTML Webview with VS Code Styling**
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
