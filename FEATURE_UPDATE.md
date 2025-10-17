# PatternStore - Feature Update

## ✅ New Features Implemented

### 1. Optional Replace Field
- The `replace` field is now **optional** in patterns
- If omitted or empty, only the Find field is populated in the search panel
- Perfect for "find-only" patterns where you just want to locate text

**Example pattern (find-only):**
```json
{
  "label": "Find all TODOs (no replace)",
  "find": "TODO",
  "flags": {
    "isRegex": false,
    "isCaseSensitive": true,
    "matchWholeWord": true,
    "isMultiline": false
  },
  "scope": "global"
}
```

### 2. Placeholder Confirmation Dialog
- When using patterns with `${prompt:name}` placeholders, you now get a **confirmation dialog**
- Shows what will be inserted into the search panel before it happens
- Gives you a chance to review or cancel

**Example:**
```
Loading pattern with resolved placeholders:

Find: "iostream"
Replace: <iostream>

[Continue] [Cancel]
```

### 3. Better UX for Dynamic Patterns
- Preview shows exactly what will be inserted
- No more guessing if placeholders resolved correctly
- Works for both find and replace fields

## How to Use

### Find-Only Pattern
1. Press `Ctrl+Alt+R`
2. Select "Find all TODOs (no replace)"
3. ✅ Only the Find field is filled, Replace stays closed
4. Perfect for searching without replacing!

### Dynamic Pattern with Preview
1. Press `Ctrl+Alt+R`
2. Select "Dynamic module import"
3. Enter value for prompt (e.g., "iostream")
4. 🔍 **Preview dialog appears** showing resolved values
5. Click "Continue" to load into search panel
6. ✅ Search panel opens with your values!

## Testing

1. **Restart Extension Development Host** (Stop and press F5 again)
2. Try the new "Find all TODOs (no replace)" pattern
3. Try the "Dynamic module import" pattern and watch for the confirmation dialog

## Benefits

✅ **Cleaner UI** - No empty replace field when not needed
✅ **Confidence** - See exactly what will be inserted before it happens  
✅ **Flexibility** - Create find-only or find-replace patterns as needed
✅ **Safety** - Cancel if the resolved values don't look right
