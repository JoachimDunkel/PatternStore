# PatternStore MVP Roadmap

## 🎯 Goal
Complete the Manage Patterns dialog to make it fully functional for creating, editing, and managing patterns.

---

## 📋 Tasks

### 1. Add New Pattern Creation
- [x] Add `+` icon button to the right side of "Workspace" section header
- [x] Add `+` icon button to the right side of "User" section header
- [x] Always show sections even when they have 0 patterns
- [x] Implement create new pattern functionality:
  - [x] Create pattern with dummy/placeholder values
  - [x] Add new pattern at the top of the respective list
  - [x] Visual indicator that pattern is incomplete/invalid
  - [x] Auto-select newly created pattern in details view

### 2. Details View - Core Functionality
- [ ] Clicking a pattern populates the details view with its data
- [ ] Save button updates/overwrites the selected pattern
- [ ] Delete button removes pattern from:
  - [ ] Storage (workspace or user settings)
  - [ ] Pattern list view
  - [ ] Details view (reset to empty state)
- [ ] Empty state when no pattern is selected:
  - [ ] Show empty icon/placeholder
  - [ ] Clear/disable form fields

### 3. Details View - UI Improvements
- [ ] Replace flag text labels with VSCode icons:
  - [ ] Regex flag → icon
  - [ ] Case Sensitive flag → icon
  - [ ] Whole Word flag → icon
- [ ] Make UI more compact:
  - [ ] Reduce padding/spacing
  - [ ] Smaller input fields
  - [ ] Condensed form layout
- [ ] Add visual feedback for validation errors

### 4. Resizable Panels
- [ ] Implement horizontal resize between pattern list and details view
- [ ] Add draggable divider/handle
- [ ] Save panel size preference in webview state
- [ ] Set sensible min/max widths for both panels

---

## 🚀 Nice-to-Have (Post-MVP)
- [ ] Keyboard shortcuts (e.g., `Ctrl+S` to save in details view)
- [ ] Duplicate pattern button
- [ ] Drag-and-drop to reorder patterns
- [ ] Export/Import patterns
- [ ] Pattern validation with real-time feedback
- [ ] Undo/Redo functionality

---

## 📝 Notes
- Keep the search functionality working throughout all changes
- Maintain collapsible section state
- Ensure proper message passing between webview and extension
- Test with both empty and populated pattern lists
