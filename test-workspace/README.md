# PatternStore Test Workspace

This workspace contains example files for testing the PatternStore extension.

## Example Patterns to Test

### 1. Import Quotes to Angles (C++)
**Pattern:** `"([^"]+)"` → `<$1>`
- Open `example.cpp`
- Search: `"([^"]+)"` (with regex enabled)
- Replace: `<$1>`
- Result: Converts `#include "iostream"` to `#include <iostream>`

### 2. TODO
**Pattern:** `TODO` → `FIXME`
- Open any file
- Search: `TODO` (whole word match)
- Replace: `FIXME`
- Result: Changes all TODO comments to FIXME

### 3. Test the Extension

#### Load Pattern (Fast Method):
1. Press `Ctrl+Alt+R`
2. Select a pattern from the list
3. The Search panel opens with the pattern loaded
4. Click "Replace All" to apply to current file

#### Using Search Panel:
1. Press `Ctrl+Shift+F` to open Search
2. Click the 📂 icon in the Search toolbar
3. Select a pattern
4. Review matches
5. Replace as needed

## Files Included

- `example.cpp` - C++ code with TODO comments and quoted includes
- `example.py` - Python code with TODO comments
- `example.js` - JavaScript code with TODO comments and imports
- `README.md` - This file

## Quick Test Steps

1. **Open this workspace** in the Extension Development Host
2. **Press `Ctrl+Alt+R`** to load a pattern
3. **Select "TODO"**
4. **Press `Ctrl+H`** to see the replacements
5. **Click "Replace All"** to apply changes

Enjoy testing PatternStore! 🎉
