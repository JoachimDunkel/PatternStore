# PatternStore — VS Code Extension Spec

## 1. Overview
**PatternStore** lets you save and recall reusable *regex find/replace* pairs directly from the Search panel.

## 2. Goals / Non-Goals
- **Goals:** Save current search; load into Search panel; manage entries; workspace/global storage; tiny UI.
- **Non-Goals:** Full macro engine, cross-file batch ops (VS Code already handles), cloud sync.

## 3. Functional Requirements
- **Save pattern:** Prompt for name; capture current *Find*, *Replace*, flags (regex, case, word, multiline).
- **Load pattern:** QuickPick list → prefill Search panel.
- **Manage:** Rename, overwrite, delete.
- **Scopes:** Global (user settings) and Workspace (project `.vscode/settings.json`).
- **UI entry points:**
  - Commands: `patternStore.save`, `patternStore.load`, `patternStore.manage`.
  - Keyboard shortcut for *Load* (default unbound; docs show example).
  - Optional: Search view toolbar button (best-effort).
- **Validation:** Reject invalid regex on save; confirm overwrite on name collision.

## 4. Data Model
```ts
export interface RegexPattern {
  label: string;       // unique within scope
  find: string;        // raw regex source
  replace: string;     // replacement string
  flags: {
    isRegex: boolean;
    isCaseSensitive: boolean;
    matchWholeWord: boolean;
    isMultiline: boolean;
  };
  scope: "global" | "workspace";
}


## Additional:

8. Edge Cases

Search panel closed → open it before operations.

Invalid regex → show error; allow save only if isRegex=false or fixed.

Duplicate labels → prompt overwrite / rename.

Workspace read-only settings → fall back to global with notice.

9. Acceptance Criteria

Save+Load round-trip preserves find/replace and flags.

Workspace patterns override global on label conflict (both visible, scope shown).

All commands work with no file open.

No writes outside VS Code settings.

10. Tech Notes

Language: TypeScript.

No heavy deps; use VS Code API only.

Dispose all subscriptions on deactivate.

### File structure:

patternstore/
  ├─ src/
  │   ├─ extension.ts
  │   ├─ storage.ts        // read/write settings
  │   ├─ searchCtx.ts      // get/set search panel state
  │   └─ types.ts
  ├─ package.json
  ├─ README.md
  ├─ CHANGELOG.md
  ├─ LICENSE
  └─ tsconfig.json

### Extension integration:

package.json (relevant):

activationEvents: onCommand:patternStore.save, onCommand:patternStore.load, onCommand:patternStore.manage

contributes.commands: three commands above

contributes.configuration: keys in §4

contributes.keybindings: example for load (optional)

contributes.menus:

"commandPalette" for all

Optional "view/title" for Search view toolbar (fallback if not supported on all builds)


## example

import * as vscode from 'vscode';

const RE = /\$\{prompt:([^}]+)\}/g;

async function resolvePlaceholders(s: string) {
  const names = [...new Set(Array.from(s.matchAll(RE), m => m[1]))];
  const vals: Record<string,string> = {};
  for (const n of names) {
    const v = await vscode.window.showInputBox({ prompt: `Value for ${n}` });
    if (v === undefined) throw new Error('Cancelled');
    vals[n] = v;
  }
  return s.replace(RE, (_, n) => vals[n] ?? "");
}

export async function runPattern(pat: {
  find: string; replace: string;
  flags: { isRegex: boolean; isCaseSensitive: boolean; matchWholeWord: boolean; preserveCase?: boolean; }
}) {
  const query   = await resolvePlaceholders(pat.find);
  const replace = await resolvePlaceholders(pat.replace);

  await vscode.commands.executeCommand("workbench.action.findInFiles", {
    query, replace,
    triggerSearch: false,
    isRegex: pat.flags.isRegex,
    isCaseSensitive: pat.flags.isCaseSensitive,
    matchWholeWord: pat.flags.matchWholeWord,
    preserveCase: pat.flags.preserveCase ?? false,
  });
}

## example saved pattern:

{
  "label": "Quotes→Angles for module",
  "find": "\"\\${prompt:module}([^\"]*)\"",
  "replace": "<${prompt:module}$1>",
  "flags": { "isRegex": true, "isCaseSensitive": true, "matchWholeWord": false }
}
