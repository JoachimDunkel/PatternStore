# PatternStore - Placeholder & UX Fixes

## ✅ Issues Fixed

### 1. Removed Extra Backslash
**Problem:** Pattern had `\"\\${prompt:module}` which escaped the `$`, preventing placeholder recognition
**Fix:** Changed to `\"${prompt:module}` - now works correctly

### 2. Removed Confirmation Dialog
**Problem:** Annoying "Continue/Cancel" dialog appeared for dynamic patterns
**Fix:** Removed - now directly loads the pattern after resolving placeholders (not destructive)

### 3. Single Prompt Per Placeholder
**Problem:** Same placeholder name prompted multiple times (once for find, once for replace)
**Fix:** New `resolvePlaceholdersMultiple()` function collects all unique placeholders and prompts only once

### 4. Correct Pattern Behavior
- Pattern: `"${prompt:module}([^"]*)"`  →  `<${prompt:module}$1>`
- User enters: `map`
- Result Find: `"map([^"]*)"`
- Result Replace: `<map$1>`
- ✅ No extra backslashes, same value in both find and replace!

## How It Works Now

### Dynamic Pattern Flow:
1. User presses `Ctrl+Alt+R`
2. Selects "Dynamic module import"
3. **Single prompt appears**: "Value for module"
4. User enters value (e.g., "map")
5. **Directly loads into search panel** - no confirmation needed
6. Find field: `"map([^"]*)"`
7. Replace field: `<map$1>`

### Benefits:
✅ **One prompt** - not multiple prompts for same placeholder
✅ **No confirmation** - faster workflow  
✅ **Correct escaping** - no extra backslashes
✅ **Consistent values** - same placeholder value used in both find and replace

## Test It

1. **Restart Extension Development Host** (Stop and press F5)
2. Press `Ctrl+Alt+R`
3. Select "Dynamic module import"
4. Enter "map" when prompted
5. ✅ Should see: Find=`"map([^"]*)"` Replace=`<map$1>`
6. No extra prompts, no confirmation dialog!

## Example Patterns

### Static Pattern (no prompts):
```json
{
  "label": "TODO",
  "find": "TODO",
  "replace": "FIXME",
  "flags": { "isRegex": false, ... }
}
```

### Dynamic Pattern (one prompt):
```json
{
  "label": "Dynamic module import",
  "find": "\"${prompt:module}([^\"]*)\"",
  "replace": "<${prompt:module}$1>",
  "flags": { "isRegex": true, ... }
}
```

### Find-Only Pattern (no replace field):
```json
{
  "label": "Find all TODOs",
  "find": "TODO",
  "flags": { "isRegex": false, ... }
}
```
