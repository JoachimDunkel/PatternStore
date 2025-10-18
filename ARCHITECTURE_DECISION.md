# 📊 Architecture Decision Record - Webview UI

**Date:** October 18, 2025  
**Status:** Approved  
**Decision Makers:** Development Team  

---

## Context

We need to implement a UI for managing patterns (add/edit/delete) since the current approach requires manual JSON editing. We evaluated two approaches:

1. **Use the official VS Code Webview UI Toolkit**
2. **Build custom UI with native HTML/CSS**

---

## Decision

**We will use native HTML/CSS with VS Code CSS variables and Codicons**

---

## Rationale

### Why NOT Use the Webview UI Toolkit

1. **Deprecated as of January 1, 2025**
   - Official announcement: https://github.com/microsoft/vscode-webview-ui-toolkit/issues/561
   - No future updates or security patches
   - Based on FAST Foundation (also deprecated)
   - Repository archived January 6, 2025

2. **Technical Debt Risk**
   - Would become outdated dependency
   - Potential security vulnerabilities
   - May break with future VS Code versions
   - Forces migration later anyway

3. **No Unique Features We Need**
   - Toolkit provides styled components
   - Does NOT provide search/filter functionality
   - Does NOT provide data grid search
   - We'd build filtering logic regardless

### Why Native HTML/CSS IS Better

1. **Future-Proof**
   - No deprecated dependencies
   - Standard web technologies
   - Will work indefinitely
   - Easy for contributors to understand

2. **VS Code Integration**
   - CSS Variables auto-update with theme
   - Codicons match VS Code exactly
   - Same result as toolkit
   - Better performance (no extra library)

3. **Small Implementation Cost**
   - ~100 lines of CSS for components
   - ~200 lines of JavaScript for logic
   - Same as toolkit integration effort
   - More control over behavior

4. **Better Developer Experience**
   - No black box components
   - Easy to debug
   - Simple to modify
   - Standard web dev knowledge applies

---

## Implementation Details

### CSS Variables (Auto-Theming)

VS Code automatically injects CSS variables into webviews:

```css
:root {
  --vscode-input-background
  --vscode-input-foreground
  --vscode-input-border
  --vscode-button-background
  --vscode-button-foreground
  --vscode-focusBorder
  /* ... and many more */
}
```

**These update automatically when user changes theme!** ✅

### Codicons (Icon Consistency)

```html
<link href="https://unpkg.com/@vscode/codicons/dist/codicon.css" rel="stylesheet">

<i class="codicon codicon-search"></i>
<i class="codicon codicon-regex"></i>
<i class="codicon codicon-case-sensitive"></i>
```

**Same icons user sees everywhere in VS Code!** ✅

### Search/Filter Logic

**Both approaches require custom JavaScript:**
- Toolkit data-grid has NO search functionality
- We must implement filtering ourselves
- No advantage to using toolkit

### File Size Comparison

| Approach | Dependencies | Code Size |
|----------|--------------|-----------|
| Toolkit | @vscode/webview-ui-toolkit (~2MB) | ~100 lines HTML/JS |
| Native | None | ~200 lines HTML/CSS/JS |

**Native approach is actually smaller!** ✅

---

## Consequences

### Positive

- ✅ No deprecated dependencies
- ✅ Future-proof architecture
- ✅ Lighter weight (no library)
- ✅ Full control over behavior
- ✅ Easier to debug
- ✅ Standard web technologies
- ✅ Better performance
- ✅ Easier for contributors

### Negative

- ⚠️ Need to write ~100 lines of CSS ourselves
- ⚠️ No pre-built components
- ⚠️ Slightly more initial setup

### Neutral

- 🔄 Same amount of JavaScript logic needed
- 🔄 Same theming capability
- 🔄 Same icon consistency
- 🔄 Similar development time

---

## Alternatives Considered

### Alternative 1: Sequential Input Prompts (No Webview)

**Rejected because:**
- Poor UX (multiple steps)
- Can't see all fields at once
- Hard to edit existing patterns
- No visual feedback

### Alternative 2: Use Toolkit Anyway and Migrate Later

**Rejected because:**
- Creates technical debt
- Wastes time on migration
- Extension won't be "production ready"
- Users may face breaking changes

### Alternative 3: TreeView with Input Boxes

**Rejected because:**
- Limited UI flexibility
- Can't do complex forms
- Poor UX for many fields
- Still need webview for editing

---

## References

- [Webview UI Toolkit Deprecation](https://github.com/microsoft/vscode-webview-ui-toolkit/issues/561)
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code CSS Variables](https://code.visualstudio.com/api/references/theme-color)
- [Codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html)
- [Webview UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/webviews)

---

## File Filter Decision

**Decision:** Include file filters in MVP

### Rationale:

1. **Small Implementation Cost** (~15 minutes)
   - 2 optional fields in interface
   - 3 lines of code in search function
   - 10 lines in package.json schema

2. **High User Value**
   - Common use case: "Find X in .ts files only"
   - Differentiates from simple bookmarks
   - Makes patterns more powerful

3. **VS Code API Support**
   - Already supported by `findInFiles` command
   - No custom logic needed
   - Just pass-through parameters

4. **Backward Compatible**
   - Optional fields
   - Existing patterns work unchanged
   - No breaking changes

5. **Already Designed in UI**
   - Form already has input fields
   - No extra UI work
   - Natural fit in pattern form

### Implementation:

```typescript
// types.ts
export interface RegexPattern {
  // ... existing ...
  filesToInclude?: string;  // e.g., "*.ts, *.tsx"
  filesToExclude?: string;  // e.g., "node_modules/**"
}

// searchCtx.ts
await vscode.commands.executeCommand('workbench.action.findInFiles', {
  // ... existing params ...
  filesToInclude: pattern.filesToInclude,
  filesToExclude: pattern.filesToExclude,
});
```

**Total Time:** 15 minutes ✅  
**User Value:** High ✅  
**Complexity:** Low ✅  

**Decision:** INCLUDE in MVP

---

## Summary

**Chosen Architecture:**
- Native HTML for structure
- CSS with VS Code variables for styling
- Vanilla JavaScript for logic
- Codicons for icons
- File filters included in MVP

**Expected Results:**
- Looks exactly like VS Code native UI
- Auto-updates with theme changes
- No deprecated dependencies
- Future-proof
- Easy to maintain
- Great developer experience

**Risk Level:** Low  
**Confidence:** High  
**Implementation Time:** 2.5 hours  

---

## Approval

✅ **Approved** - Ready for implementation

**Next Steps:**
1. Implement file filter support (15 min)
2. Create webview structure (30 min)
3. Build CSS components (45 min)
4. Implement JavaScript logic (45 min)
5. Create WebviewManager (30 min)
6. Update commands (15 min)
7. Testing (30 min)

**Total:** ~3 hours to complete MVP
