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
- [x] Clicking a pattern populates the details view with its data
- [x] Save button updates/overwrites the selected pattern
- [x] Delete button removes pattern everywhere

- [x] Empty state when no pattern is selected:

#### 2.1 Bug: 
- [x] details view - remove -> cancel should not make the details view empty

### 3. Details View - UI Improvements
- [ ] Replace flag text labels with VSCode icons - Duplicating vs code ui

- [x] Make UI more compact:
  - [x] Reduce padding/spacing
  - [x] Smaller input fields
  - [x] Condensed form layout
- [x] Add visual feedback for validation errors
- [x] Add auto fill into the details view - this way the user can make temporary changes that get injected into the search without having them permanent

#### 3.1 Bug:
- [x] detail view | an unseclected button needs two clicks to jump to selected but only one to jump to unselected. Also it does not alway seem to be in the correct state visually
- [x] regex validation does not show red indicator on initial load or when a new details is moved into the view
- [x] save is disabled if regex is invalid - this is unnecessary.  Just show the error but allow saving. -> never disable save
- [x] when selecting another element during saving of the current detail it jumps back to the saved on.

- [x] Load to Search returns "Pattern not found" error

- [x] The load to search button should not close the dialog
- [?] The load to search button in the details view should be some where else more prominent 
- [x] we need to track if a detail is dirty and needs saving. (e.g. a cycle icon somewhere or be creative.)
- [x] The load to search button should use the current details (which may be dirty) and send those instead of the item itself.



### 4. Resizable Panels
- [x] Implement horizontal resize between pattern list and details view
- [x] Add draggable divider/handle

### 4.5 Improve performance:
- [x] Improve speed - use map for all lookups instead of array find
- [x] Improve speed - DOM caching, event delegation, resizable panels
- [ ] improve io interaction performance? possible (backend caching would be Phase 3)


### 5. Remove redundant features
- [x] Remove Search view "Save" button.
- [x] Remove PatternStore: Launch / the management tab is enough for an mvp
- [x] Remove the save button from find/replace view - it does not work anyway
- [x] The folder button in the find/replace view should open the manage tab instead of launch

- [ ] If files to include or files to exclude is empty then it should still overwrite the values in the serach view. Right now it seems to ignore them if they are empty.

---
## 6. Fix 
- [ ] Storing id's in the config prevents user from manually editing the config file. We need to find a way to store the patterns without interfering with manual edits. Postponed for now.


## Publish 
- [ ] Final testing and bug fixes
- [ ] Update documentation/screenshots
- [ ] Publish updated extension to VSCode Marketplace
---

## 🚀 Nice-to-Have (Post-MVP)
- [ ] Keyboard shortcuts (e.g., `Ctrl+S` to save in details view)
- [ ] Duplicate pattern button
- [ ] Drag-and-drop to reorder patterns
- [ ] The currently selected item should always stay on top independent of search and filtering

---


## 📝 Notes
- Keep the search functionality working throughout all changes
- Maintain collapsible section state
- Ensure proper message passing between webview and extension
- Test with both empty and populated pattern lists
