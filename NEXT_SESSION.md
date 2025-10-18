# 🚀 Next Coding Session - Complete Implementation Guide

## 📋 Session Overview

**Goal:** Implement Manage Patterns webview with file filter support  
**Time Estimate:** 2.5 - 3 hours  
**Difficulty:** Medium  

**What We're Building:**
- Native HTML webview (no deprecated toolkit)
- Pattern management UI (add/edit/delete)
- Search/filter functionality
- File scope filters (include/exclude)
- Two commands: Manage (User) and Manage (Workspace)

---

## ☑️ Pre-Session Checklist (10 minutes)

### Review Documentation:
- [ ] Read `ROADMAP.md` completely - NEW architecture decisions
- [ ] Scan `SESSION_SUMMARY.md` → "What We Built" section
- [ ] Review `ARCHITECTURE.md` → Current working features
- [ ] Check `project-specs.md` → Original requirements

### Environment Setup:
- [ ] Open project: `cd /home/dunkel3/git/privat/PatternStore`
- [ ] Install dependencies: `npm install` (if needed)
- [ ] Compile: `npm run compile`
- [ ] Test current functionality: Press `F5`
- [ ] Verify Load Pattern works: `Ctrl+Alt+R`

### Key Decisions Made:
- [x] **NO Webview UI Toolkit** - Deprecated Jan 2025
- [x] **YES File Filters** - Include in MVP (15 min implementation)
- [x] **Native HTML + CSS Variables** - Future-proof approach
- [x] **Codicons for Icons** - Match VS Code exactly
- [x] **Two Manage Commands** - Separate User/Workspace

---

## 🎯 Implementation Plan

See full detailed implementation steps in `ROADMAP.md` section:
- Phase 1: Update Data Model (15 min)
- Phase 2: Create Webview Structure (30 min)
- Phase 3: Create JavaScript Logic (45 min)
- Phase 4: Create WebviewManager (30 min)
- Phase 5: Update Commands (15 min)
- Phase 6: Testing (30 min)

**Total: ~2.5 hours**

---

## 🚦 Quick Start Steps

### Step 1: Add File Filters (15 min)

1. Update `src/types.ts`:
   ```typescript
   export interface RegexPattern {
     // ... existing fields ...
     filesToInclude?: string;
     filesToExclude?: string;
   }
   ```

2. Update `src/searchCtx.ts` in `loadPatternIntoSearch()`:
   ```typescript
   await vscode.commands.executeCommand('workbench.action.findInFiles', {
     // ... existing params ...
     filesToInclude: pattern.filesToInclude,
     filesToExclude: pattern.filesToExclude,
   });
   ```

3. Update `package.json` schema (add to items.properties)

4. Test: `npm run compile` → `F5` → Add test pattern with filters

---

### Step 2: Create Webview Files (1 hour)

1. Create directory structure:
   ```bash
   mkdir -p src/webview/styles/components
   mkdir -p src/webview/components  
   mkdir -p src/webview/views
   ```

2. Create these files (full code in ROADMAP.md):
   - `src/webview/views/managePatterns.html`
   - `src/webview/styles/base.css`
   - `src/webview/styles/layout.css`
   - `src/webview/views/managePatterns.js`
   - `src/webview/WebviewManager.ts`

3. Include Codicons in HTML:
   ```html
   <link href="https://unpkg.com/@vscode/codicons/dist/codicon.css" rel="stylesheet">
   ```

---

### Step 3: Update Extension Commands (15 min)

1. Update `src/extension.ts`:
   - Import `WebviewManager`
   - Add two new commands: `manageUser` and `manageWorkspace`
   - Remove or stub old `manage` command

2. Update `package.json`:
   - Add `patternStore.manageUser` command
   - Add `patternStore.manageWorkspace` command
   - Update toolbar integration if needed

3. Compile and test: `npm run compile` → `F5`

---

## ✅ Testing Checklist

### File Filters:
- [ ] Pattern with `filesToInclude` only
- [ ] Pattern with `filesToExclude` only
- [ ] Pattern with both filters
- [ ] Pattern with no filters (backward compat)
- [ ] Complex patterns like `*.ts, *.tsx`
- [ ] Glob patterns like `src/**`

### Webview Functionality:
- [ ] Open Manage (User) command
- [ ] Open Manage (Workspace) command
- [ ] Search patterns in real-time
- [ ] Clear search button works
- [ ] Add new pattern via form
- [ ] Edit existing pattern
- [ ] Delete pattern with confirmation
- [ ] Save button saves correctly
- [ ] Save & Load button works
- [ ] Cancel button closes editor
- [ ] Icon buttons toggle on/off
- [ ] Theme changes update colors

### Integration:
- [ ] New patterns appear in Load Pattern list
- [ ] File filters apply when loading pattern
- [ ] Placeholders still work correctly
- [ ] Global/workspace scopes work
- [ ] No TypeScript compilation errors

---

## 🐛 Common Issues & Solutions

### Issue: Webview not showing
**Solution:** Check CSP (Content Security Policy) in HTML head

### Issue: Icons not showing
**Solution:** Verify Codicons CSS link is correct

### Issue: CSS not applying
**Solution:** Check webview.asWebviewUri() paths are correct

### Issue: Messages not received
**Solution:** Verify acquireVsCodeApi() is called exactly once

### Issue: Theme not updating
**Solution:** Ensure using `var(--vscode-*)` CSS variables

---

## 📚 Key Resources

- Full HTML/CSS/JS code: See `ROADMAP.md`
- Webview API: [VS Code Docs](https://code.visualstudio.com/api/extension-guides/webview)
- Codicons: [Icon Gallery](https://microsoft.github.io/vscode-codicons/dist/codicon.html)
- CSS Variables: [Theme Colors](https://code.visualstudio.com/api/references/theme-color)

---

## 🎉 Success Criteria

MVP is complete when:
1. ✅ Users can add patterns via UI (no JSON editing needed)
2. ✅ Users can edit existing patterns
3. ✅ Users can delete patterns
4. ✅ Users can search/filter pattern list
5. ✅ Patterns support file filters (include/exclude)
6. ✅ UI matches VS Code design language
7. ✅ UI auto-updates with theme changes
8. ✅ All existing features still work
9. ✅ Documentation is updated
10. ✅ All tests pass

**Good luck! 🚀**
