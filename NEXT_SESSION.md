# 🚀 Next Coding Session - Preparation Checklist

## Before You Start

### ☑️ Review Documentation (10 minutes)
- [ ] Read `ROADMAP.md` completely
- [ ] Review `SESSION_SUMMARY.md` → "What We Built Today"
- [ ] Scan `ARCHITECTURE.md` → "Future Architecture"
- [ ] Check `QUICK_REFERENCE.md` → Current features

### ☑️ Environment Setup (5 minutes)
- [ ] Open project: `cd /home/dunkel3/git/privat/PatternStore`
- [ ] Install dependencies: `npm install` (if needed)
- [ ] Compile: `npm run compile`
- [ ] Test current functionality: Press `F5`
- [ ] Verify patterns load correctly: `Ctrl+Alt+R`

### ☑️ Technical Research (10 minutes)
- [ ] VS Code Webview API documentation
- [ ] Check `workbench.action.findInFiles` available parameters
- [ ] Review existing `savePatternCommand()` in `src/extension.ts`

---

## Session Goals

### 🎯 Primary Goal: Save Pattern Webview

**Create a standalone dialog for creating patterns without JSON editing.**

**Time Estimate:** 30-45 minutes

#### Tasks Breakdown:

**1. Setup Webview Structure (10 min)**
- [ ] Create `src/webview/` directory
- [ ] Create `editPattern.html` with form
- [ ] Create `editPattern.css` for styling
- [ ] Create `WebviewManager.ts` for handling

**2. Implement Form (15 min)**
- [ ] Add input fields (name, find, replace)
- [ ] Add checkboxes (regex, case, whole word, multiline)
- [ ] Add radio buttons (global/workspace scope)
- [ ] Add optional fields (files to include/exclude)
- [ ] Add action buttons (Save, Save & Load, Cancel)

**3. Wire Up Communication (10 min)**
- [ ] Implement message passing (webview → extension)
- [ ] Handle save button click
- [ ] Call `storage.savePattern()`
- [ ] Optionally call `searchCtx.loadPatternIntoSearch()`
- [ ] Close webview on success

**4. Testing (10 min)**
- [ ] Test creating new pattern via webview
- [ ] Test saving to global settings
- [ ] Test saving to workspace settings
- [ ] Test "Save & Load" functionality
- [ ] Verify settings.json is updated correctly

---

### 🎯 Secondary Goal: File Scope Integration

**Add include/exclude file filters to patterns.**

**Time Estimate:** 15-20 minutes

#### Tasks Breakdown:

**1. Update Data Model (5 min)**
- [ ] Add `filesToInclude?: string` to `RegexPattern` interface
- [ ] Add `filesToExclude?: string` to `RegexPattern` interface
- [ ] Update `package.json` JSON schema

**2. Update Search Logic (5 min)**
- [ ] Modify `loadPatternIntoSearch()` in `src/searchCtx.ts`
- [ ] Add file scope parameters to `findInFiles` command
- [ ] Test with conditional inclusion

**3. Update Examples (5 min)**
- [ ] Add example patterns with file scope
- [ ] Update `example-settings.json`
- [ ] Update user settings for testing

**4. Testing (5 min)**
- [ ] Test pattern with `filesToInclude` only
- [ ] Test pattern with `filesToExclude` only
- [ ] Test pattern with both filters
- [ ] Test pattern with no filters (backward compatibility)

---

## Step-by-Step Implementation Guide

### Phase 1: Webview Dialog

#### 1.1 Create Directory Structure
```bash
cd /home/dunkel3/git/privat/PatternStore
mkdir -p src/webview
```

#### 1.2 Create `src/webview/editPattern.html`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* VS Code theme colors */
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input, textarea { width: 100%; padding: 5px; }
        textarea { min-height: 60px; }
        .checkbox-group { display: flex; gap: 15px; }
        .button-group { margin-top: 20px; display: flex; gap: 10px; }
        button { padding: 8px 16px; }
    </style>
</head>
<body>
    <form id="patternForm">
        <div class="form-group">
            <label>Pattern Name *</label>
            <input type="text" id="label" required>
        </div>
        
        <div class="form-group">
            <label>Find *</label>
            <textarea id="find" required></textarea>
        </div>
        
        <div class="form-group">
            <label>Replace (optional)</label>
            <textarea id="replace"></textarea>
        </div>
        
        <div class="form-group">
            <div class="checkbox-group">
                <label><input type="checkbox" id="isRegex"> Regex</label>
                <label><input type="checkbox" id="isCaseSensitive"> Case Sensitive</label>
                <label><input type="checkbox" id="matchWholeWord"> Whole Word</label>
                <label><input type="checkbox" id="isMultiline"> Multiline</label>
            </div>
        </div>
        
        <div class="form-group">
            <label>Scope</label>
            <label><input type="radio" name="scope" value="global" checked> Global</label>
            <label><input type="radio" name="scope" value="workspace"> Workspace</label>
        </div>
        
        <div class="form-group">
            <label>Files to Include (optional)</label>
            <input type="text" id="filesToInclude" placeholder="e.g., *.ts, *.js">
        </div>
        
        <div class="form-group">
            <label>Files to Exclude (optional)</label>
            <input type="text" id="filesToExclude" placeholder="e.g., *.test.ts, node_modules">
        </div>
        
        <div class="button-group">
            <button type="submit">Save</button>
            <button type="button" id="saveAndLoad">Save & Load</button>
            <button type="button" id="cancel">Cancel</button>
        </div>
    </form>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('patternForm').addEventListener('submit', (e) => {
            e.preventDefault();
            savePattern(false);
        });
        
        document.getElementById('saveAndLoad').addEventListener('click', () => {
            savePattern(true);
        });
        
        document.getElementById('cancel').addEventListener('click', () => {
            vscode.postMessage({ command: 'cancel' });
        });
        
        function savePattern(andLoad) {
            const pattern = {
                label: document.getElementById('label').value,
                find: document.getElementById('find').value,
                replace: document.getElementById('replace').value,
                flags: {
                    isRegex: document.getElementById('isRegex').checked,
                    isCaseSensitive: document.getElementById('isCaseSensitive').checked,
                    matchWholeWord: document.getElementById('matchWholeWord').checked,
                    isMultiline: document.getElementById('isMultiline').checked
                },
                scope: document.querySelector('input[name="scope"]:checked').value,
                filesToInclude: document.getElementById('filesToInclude').value,
                filesToExclude: document.getElementById('filesToExclude').value
            };
            
            vscode.postMessage({ 
                command: andLoad ? 'saveAndLoad' : 'save', 
                pattern 
            });
        }
    </script>
</body>
</html>
```

#### 1.3 Create `src/webview/WebviewManager.ts`
```typescript
import * as vscode from 'vscode';
import * as storage from '../storage';
import * as searchCtx from '../searchCtx';
import { RegexPattern } from '../types';
import * as path from 'path';
import * as fs from 'fs';

export class WebviewManager {
    private panel: vscode.WebviewPanel | undefined;
    
    public async showEditDialog(context: vscode.ExtensionContext) {
        // Create or show existing panel
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        
        this.panel = vscode.window.createWebviewPanel(
            'patternStoreEdit',
            'Create Pattern',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'))]
            }
        );
        
        // Load HTML
        const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'editPattern.html');
        this.panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
        
        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'save':
                    await this.savePattern(message.pattern, false);
                    break;
                case 'saveAndLoad':
                    await this.savePattern(message.pattern, true);
                    break;
                case 'cancel':
                    this.panel?.dispose();
                    break;
            }
        });
        
        // Cleanup
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    
    private async savePattern(pattern: any, andLoad: boolean) {
        try {
            // Clean up pattern
            const cleanPattern: RegexPattern = {
                label: pattern.label,
                find: pattern.find,
                replace: pattern.replace || undefined,
                flags: pattern.flags,
                scope: pattern.scope,
                filesToInclude: pattern.filesToInclude || undefined,
                filesToExclude: pattern.filesToExclude || undefined
            };
            
            // Save to storage
            await storage.savePattern(cleanPattern);
            
            // Optionally load into search
            if (andLoad) {
                await searchCtx.loadPatternIntoSearch(cleanPattern);
            }
            
            // Close dialog
            this.panel?.dispose();
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save pattern: ${error}`);
        }
    }
}
```

#### 1.4 Update `src/extension.ts`
```typescript
// Add at top
import { WebviewManager } from './webview/WebviewManager';

// In activate()
const webviewManager = new WebviewManager();

// Update savePatternCommand()
async function savePatternCommand(): Promise<void> {
    await webviewManager.showEditDialog(context);
}

// Pass context to activate
export function activate(context: vscode.ExtensionContext) {
    // ... existing code ...
    
    const saveCommand = vscode.commands.registerCommand('patternStore.save', async () => {
        await webviewManager.showEditDialog(context);
    });
    
    // ... rest of code ...
}
```

---

### Phase 2: File Scope

#### 2.1 Update `src/types.ts`
```typescript
export interface RegexPattern {
    // ... existing fields ...
    filesToInclude?: string;
    filesToExclude?: string;
}
```

#### 2.2 Update `src/searchCtx.ts`
```typescript
// In loadPatternIntoSearch()
const commandArgs: any = {
    query: find,
    triggerSearch: false,
    // ... existing flags ...
};

// Add file scope if specified
if (pattern.filesToInclude) {
    commandArgs.filesToInclude = pattern.filesToInclude;
}
if (pattern.filesToExclude) {
    commandArgs.filesToExclude = pattern.filesToExclude;
}

// Only include replace if not empty
if (hasReplace) {
    commandArgs.replace = replace;
}
```

---

## Testing Checklist

### Webview Dialog Testing
- [ ] Dialog opens when Save Pattern command is run
- [ ] All form fields are functional
- [ ] Validation works (required fields)
- [ ] Save button creates pattern in settings.json
- [ ] Save & Load button creates pattern AND loads it
- [ ] Cancel button closes dialog without saving
- [ ] Global scope saves to user settings
- [ ] Workspace scope saves to workspace settings

### File Scope Testing
- [ ] Pattern with filesToInclude works
- [ ] Pattern with filesToExclude works
- [ ] Pattern with both filters works
- [ ] Pattern without filters works (backward compatible)
- [ ] Filters are passed to search panel correctly

---

## Success Criteria

✅ **Phase 1 Complete When:**
- User can create patterns via webview dialog
- Patterns save correctly to settings.json
- "Save & Load" immediately loads the pattern
- No manual JSON editing required

✅ **Phase 2 Complete When:**
- Patterns can specify file filters
- Filters work correctly in search
- Backward compatibility maintained

---

## Time Budget

| Task | Time | Running Total |
|------|------|---------------|
| Environment setup | 5 min | 5 min |
| Documentation review | 10 min | 15 min |
| Technical research | 10 min | 25 min |
| Webview structure | 10 min | 35 min |
| Webview form | 15 min | 50 min |
| Message passing | 10 min | 60 min |
| Webview testing | 10 min | 70 min |
| File scope model | 5 min | 75 min |
| File scope logic | 5 min | 80 min |
| File scope examples | 5 min | 85 min |
| File scope testing | 5 min | 90 min |

**Total Estimated Time:** 90 minutes (1.5 hours)

---

## Resources

**Key Files to Edit:**
- `src/webview/editPattern.html` (new)
- `src/webview/WebviewManager.ts` (new)
- `src/extension.ts` (modify savePatternCommand)
- `src/types.ts` (add file scope fields)
- `src/searchCtx.ts` (add file scope parameters)

**Documentation to Reference:**
- VS Code Webview API: https://code.visualstudio.com/api/extension-guides/webview
- VS Code Configuration API: https://code.visualstudio.com/api/references/vscode-api#workspace

**Example Code:**
- Current `savePatternCommand()` in `src/extension.ts`
- Current `loadPatternIntoSearch()` in `src/searchCtx.ts`

---

## Quick Commands

```bash
# Compile
npm run compile

# Test (Press F5 in VS Code)

# Check for errors
npm run lint

# Clean rebuild
rm -rf out/ && npm run compile
```

---

**You're Ready! Let's Build This! 🚀**
