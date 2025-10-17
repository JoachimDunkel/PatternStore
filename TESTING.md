# Testing PatternStore Extension

## Quick Start

### 1. Add Test Patterns to Your Settings

Copy the patterns from `example-settings.json` and add them to your VS Code settings:

**For User (Global) Settings:**
1. Press `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
2. Add the content from `example-settings.json`

**For Workspace Settings:**
1. Press `Ctrl+Shift+P` → "Preferences: Open Workspace Settings (JSON)"
2. Add the workspace patterns

### 2. Run the Extension in Debug Mode

1. Press `F5` to launch the Extension Development Host
2. A new VS Code window will open with your extension loaded

### 3. Test Loading Patterns

**Method A: Using Keybinding (Fastest)**
1. Press `Ctrl+Alt+R`
2. Select a pattern from the list
3. If it has `${prompt:...}` placeholders, enter values
4. ✅ Check that the Search panel opens with the pattern loaded!

**Method B: Using Command Palette**
1. Press `Ctrl+Shift+P`
2. Type "PatternStore: Load Pattern"
3. Select a pattern
4. ✅ Check the Search panel!

**Method C: Using Toolbar Button**
1. Open Search view (`Ctrl+Shift+F`)
2. Look for the 📂 (folder) icon in the Search panel toolbar
3. Click it to load a pattern

### 4. Test Managing Patterns

1. Press `Ctrl+Shift+P` → "PatternStore: Manage Patterns"
2. Select a pattern
3. Choose "Rename" or "Delete"
4. ✅ Check that settings are updated!

### 5. Test Placeholders

1. Load the "Dynamic module import" pattern (`Ctrl+Alt+R`)
2. When prompted, enter a module name (e.g., "iostream")
3. ✅ The pattern should be expanded with your value!

## Example Patterns

The `example-settings.json` includes:

1. **Import quotes to angles** - Converts "header.h" to <header.h> using regex
2. **TODO** - Simple text replacement
3. **Dynamic module import** - Uses `${prompt:module}` placeholder
4. **Workspace specific pattern** - Example workspace pattern

## What Works

- ✅ Load patterns into search panel
- ✅ Placeholder resolution (`${prompt:name}`)
- ✅ Global and workspace patterns
- ✅ Rename patterns
- ✅ Delete patterns
- ✅ Keybinding support
- ✅ Toolbar buttons in Search view

## What's Not Implemented Yet

- ⚠️ Save Pattern command (reading from search panel)
  - Currently the Save command tries to use editor selection, but doesn't actually save
  - You need to manually add patterns to settings.json for now

## Troubleshooting

**No patterns appear when loading:**
- Check that you've added patterns to your settings.json
- Verify the JSON format matches the example

**Search panel doesn't open:**
- Make sure you're in the Extension Development Host window (launched with F5)
- Check the Debug Console for errors

**Toolbar buttons don't appear:**
- Open the Search view (`Ctrl+Shift+F`)
- Look in the top-right corner of the Search panel

## Next Steps

Once basic loading/managing works, we can implement:
1. Save Pattern UI (manual entry workflow)
2. Import/Export patterns
3. Pattern categories/tags
