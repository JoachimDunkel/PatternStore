# PatternStore Roadmap


## TODO before publish:
- [ ] if include and exclude are empty they should still overwrite old left over values in the search panel
- [ ] improve/update the readme file.


## Publish
- [ ] Final testing and bug fixes
- [ ] Update documentation/screenshots
- [ ] Publish updated extension to VSCode Marketplace
---

## 6. Backend Optimization (In Progress)
- [x] Remove IDs from stored patterns in settings.json (only runtime IDs)
- [x] Implement index-based ID generation (`${scope}-${index}`)
- [x] Add configuration change watcher to detect external edits
- [x] Update pattern operations (save/delete/rename) to use label+scope lookup
- Benefits: Clean JSON for manual editing, always consistent state, handles all edge cases
---


## 🚀 Nice-to-Have (Post-MVP)
- [ ] Keyboard shortcuts (e.g., `Ctrl+S` to save in details view)
- [ ] Duplicate pattern button
- [ ] Drag-and-drop to reorder patterns
- [ ] The currently selected item should always stay on top independent of search and filtering

---
