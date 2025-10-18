# Session Decisions - October 18, 2025

## 🎯 UI/UX Design Decisions

### ✅ Approved Design Choices:

1. **Single Command Approach**
   - One "Manage Patterns" command (not separate User/Workspace)
   - Show ALL patterns (both scopes) in single view
   - Rationale: Simpler, see everything at once, avoid duplicate commands

2. **Collapsible Sections by Scope**
   - ▶/▼ expandable sections for "Workspace" and "User"
   - Show pattern count: `Workspace (3)`, `User (2)`
   - Remember collapse state
   - Rationale: Better than filter toggles, matches VS Code patterns

3. **Auto-Save on Change**
   - No explicit "Save" button
   - Changes save automatically after 500ms debounce
   - Show subtle "Saving..." indicator
   - Rationale: Simpler UX, less cognitive load, matches VS Code settings

4. **Inline Action Buttons**
   - [🗑️] Delete - on each pattern item
   - [📋] Load - loads pattern to search and closes webview
   - Rationale: Quick access, fewer clicks

5. **Multi-Select Mode**
   - Checkbox in search box toggles multi-select mode
   - Shows individual checkboxes on patterns when active
   - "Delete Selected (N)" bulk action
   - Rationale: Power user feature, efficient bulk operations

6. **Icon-Based Flag Buttons**
   - Use Codicons instead of text checkboxes
   - Match VS Code search panel style
   - Visual active/inactive states
   - Rationale: Cleaner UI, familiar to users

7. **Collapsible Replace Section**
   - Replace field hidden by default (▶ to expand)
   - Many patterns are find-only
   - Rationale: Cleaner default view, optional complexity

8. **Resizable Panels**
   - Draggable divider between list and details
   - User controls horizontal space allocation
   - Save sizes to localStorage
   - Rationale: User preference, adaptable workflow

9. **Fuzzy Search**
   - Filter patterns as you type
   - Auto-expand sections with matches
   - Hide empty sections
   - Rationale: Fast pattern discovery

### ❌ Rejected Design Choices:

1. **Two Separate Commands** (User/Workspace)
   - Problem: Duplicate names still possible, more complexity
   - Solution: Show all in one view with scope badges

2. **Filter Toggle Buttons [W][U]**
   - Problem: Less intuitive than collapsibles
   - Solution: Collapsible sections with chevrons

3. **Explicit Save/Revert Buttons**
   - Problem: Overengineered, dirty state tracking complex
   - Solution: Auto-save approach (simpler)

4. **Text-Based Flag Checkboxes**
   - Problem: Takes more space, less visual
   - Solution: Icon toggle buttons

---

## 🛠️ Technical Decisions

### Architecture:

1. **Native HTML + CSS Variables**
   - NOT using deprecated Webview UI Toolkit
   - Use VS Code CSS variables for auto-theming
   - Use Codicons for icons
   - Rationale: Future-proof, maintainable, lightweight

2. **Two-Panel Layout**
   - Left: Pattern list with search/filter
   - Right: Pattern details form
   - Resizable divider between panels
   - Rationale: Standard pattern, efficient space use

3. **Message Passing Protocol**
   - Webview → Extension: save, delete, load requests
   - Extension → Webview: pattern data, confirmations
   - Rationale: VS Code webview architecture

4. **Storage in settings.json**
   - Global patterns: user settings
   - Workspace patterns: workspace settings
   - Rationale: Already implemented, works well

---

## 📋 Implementation Phases

### Phase 1: File Filters ✅ COMPLETE (20 min)
- Added `filesToInclude` and `filesToExclude` to types
- Updated search integration
- Updated package.json schema
- Tested and working

### Phase 2: Webview Shell ✅ COMPLETE (10 min)
- Created WebviewManager.ts
- Basic HTML structure
- Two-column layout with CSS

### Phase 3: Pattern List 🚧 NEXT (80 min)
- Load and display patterns grouped by scope
- Collapsible sections with chevrons
- Inline action buttons (delete, load)
- Search/filter functionality
- Multi-select mode with bulk delete

### Phase 4: Details Panel (75 min)
- Resizable panels
- Display pattern details
- Collapsible replace section
- Icon-based flag buttons
- Auto-save on change
- Load to search button

### Phase 5: Polish (30 min)
- Empty states
- Validation
- Keyboard navigation
- Confirmation dialogs

**Total Remaining:** ~3 hours

---

## 🎨 UI Mockups

### Pattern List (Normal Mode):
```
┌──────────────────────────────────┐
│ [ ] | 🔍 Search patterns...     │
├──────────────────────────────────┤
│ ▼ Workspace (3)                  │
│   Pattern 1          [🗑️][📋]   │
│   Pattern 2          [🗑️][📋]   │
│   Pattern 3          [🗑️][📋]   │
│                                  │
│ ▼ User (2)                       │
│   Pattern 4          [🗑️][📋]   │
│   Pattern 5          [🗑️][📋]   │
└──────────────────────────────────┘
```

### Pattern List (Multi-Select Mode):
```
┌──────────────────────────────────┐
│ [✓] | 🔍 Search patterns...     │
│ [Delete Selected (2)]            │
├──────────────────────────────────┤
│ ▼ Workspace (3)                  │
│   [ ] Pattern 1                  │
│   [✓] Pattern 2                  │
│   [ ] Pattern 3                  │
│                                  │
│ ▼ User (2)                       │
│   [✓] Pattern 4                  │
│   [ ] Pattern 5                  │
└──────────────────────────────────┘
```

---

## 💬 Key Discussion Points

### Q: Should scope be editable in the webview?
**A:** Yes, via dropdown. Allows converting User ↔ Workspace patterns easily.

### Q: What if same pattern name exists in both scopes?
**A:** Allow it. The scope badge makes it clear which is which. User might intentionally have different patterns with same name.

### Q: What does "Load to Search" button do?
**A:** Calls the existing `loadPatternIntoSearch()` function, populates VS Code search panel, then closes the webview.

### Q: How does auto-save work?
**A:** Debounced onChange handlers (500ms delay). Edit field → wait 500ms → save to settings.json. Shows "Saving..." indicator during save.

### Q: What search algorithm?
**A:** Start with simple case-insensitive substring match. Can upgrade to fuzzy match later if needed (like VS Code's Ctrl+P).

---

## 🚀 Next Steps

1. **Continue with Phase 3, Chunk 3.1**
   - Load patterns from storage
   - Group by scope
   - Send to webview
   - Render basic list

2. **Test iteratively**
   - Each chunk verified before moving to next
   - User tests in F5 development host

3. **Document as we go**
   - Update PROJECT_STATUS.md after each phase
   - Keep ROADMAP.md in sync

---

## 📚 Reference

- **PROJECT_STATUS.md** - Current implementation state
- **ROADMAP.md** - Detailed implementation guide with code examples
- **This file** - Design decisions and rationale

Last updated: October 18, 2025
