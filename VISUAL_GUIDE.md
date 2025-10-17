# 🚀 PatternStore - Visual Quick Start

## For First-Time Users

### What is PatternStore?
Save your frequently-used find/replace patterns and load them instantly!

```
Instead of typing this every time:
┌────────────────────────────────────────┐
│ Find:    "([^"]+)"                     │
│ Replace: <$1>                          │
│ ☑ Regex  ☑ Case  ☐ Word  ☐ Multi     │
└────────────────────────────────────────┘

Save it once, load instantly:
Press Ctrl+Alt+R → Select "Import quotes to angles" → Done! ✅
```

---

## ⚡ Quick Start (3 Steps)

### Step 1: Add Example Patterns (2 minutes)

1. Press `Ctrl+Shift+P`
2. Type: `Preferences: Open User Settings (JSON)`
3. Copy from `example-settings.json` and paste

### Step 2: Test It! (30 seconds)

1. Press `Ctrl+Alt+R`
2. Select a pattern
3. ✅ Search panel opens with your pattern!

### Step 3: Use It! (ongoing)

Whenever you need that pattern again:
`Ctrl+Alt+R` → Select → Done!

---

## 📊 Visual Workflow

### Traditional Way (Slow)
```
Every time you need to search:
  1. Open Search (Ctrl+Shift+F)
  2. Type find text
  3. Type replace text
  4. Check regex checkbox
  5. Check case checkbox
  6. ...
  Total: 6+ steps, 30+ seconds
```

### PatternStore Way (Fast)
```
After setting up once:
  1. Press Ctrl+Alt+R
  2. Select pattern
  Total: 2 steps, 3 seconds ⚡
```

---

## 🎯 Common Use Cases

### Use Case 1: Code Refactoring
**Problem:** Need to change all `TODO` to `FIXME`

**Without PatternStore:**
```
1. Open search
2. Type "TODO"
3. Type "FIXME"
4. Check "Match Whole Word"
5. Search
```

**With PatternStore:**
```
1. Ctrl+Alt+R
2. Select "TODO to FIXME"
Done! ✅
```

---

### Use Case 2: Regex Patterns
**Problem:** Convert `#include "header.h"` to `#include <header.h>`

**Without PatternStore:**
```
1. Open search
2. Type: "([^"]+)"
3. Type: <$1>
4. Enable regex
5. Hope you didn't make a typo in the regex!
```

**With PatternStore:**
```
1. Ctrl+Alt+R
2. Select "Import quotes to angles"
Perfect regex, every time! ✅
```

---

### Use Case 3: Dynamic Patterns
**Problem:** Convert module imports, but module name changes

**Pattern:**
```json
{
  "find": "\"${prompt:module}([^\"]*)\"",
  "replace": "<${prompt:module}$1>"
}
```

**Usage:**
```
1. Ctrl+Alt+R
2. Select "Dynamic module import"
3. Enter: "iostream"
4. Searches for: "iostream([^"]*)"
5. Replaces with: <iostream$1>
Reusable with any module! ✅
```

---

## 🎨 Visual Command Reference

### Keyboard Shortcuts
```
┌─────────────────────────────────────────────────────────┐
│ Ctrl+Alt+R          Load Pattern (most used!)          │
│ Ctrl+Shift+P        Command Palette                     │
│ Ctrl+Shift+F        Open Search Panel                   │
└─────────────────────────────────────────────────────────┘
```

### Toolbar Buttons
```
When Search panel is open:
┌────────────────────────────────────────┐
│ Search                        [📂] [💾] │  ← PatternStore buttons
│ ┌────────────────────────────┐         │
│ │ Find: [____________]       │         │
│ │ Replace: [____________]    │         │
│ └────────────────────────────┘         │
└────────────────────────────────────────┘

📂 = Load Pattern
💾 = Save Pattern (coming soon)
```

### Command Palette
```
Ctrl+Shift+P → Type "PatternStore"

┌──────────────────────────────────────────────┐
│ > PatternStore                               │
│   PatternStore: Load Pattern      Ctrl+Alt+R │
│   PatternStore: Manage Patterns              │
│   PatternStore: Save Pattern                 │
└──────────────────────────────────────────────┘
```

---

## 📝 Pattern Examples Gallery

### 1. Find-Only Pattern
```json
{
  "label": "Find all TODOs",
  "find": "TODO",
  "flags": {
    "isRegex": false,
    "isCaseSensitive": true,
    "matchWholeWord": true
  }
}
```
**Use:** Quickly find all TODO comments
**Result:** Only find field filled, no replace

---

### 2. Simple Replace
```json
{
  "label": "TODO to FIXME",
  "find": "TODO",
  "replace": "FIXME",
  "flags": {
    "isRegex": false,
    "isCaseSensitive": true,
    "matchWholeWord": true
  }
}
```
**Use:** Convert all TODO comments to FIXME
**Result:** Both find and replace filled

---

### 3. Regex Pattern
```json
{
  "label": "Import quotes to angles",
  "find": "\"([^\"]+)\"",
  "replace": "<$1>",
  "flags": {
    "isRegex": true
  }
}
```
**Use:** Change `"header"` to `<header>`
**Result:** Powerful regex, no typos!

---

### 4. Dynamic Pattern
```json
{
  "label": "Find function calls",
  "find": "${prompt:functionName}\\(",
  "flags": {
    "isRegex": true
  }
}
```
**Use:** Find all calls to a specific function
**Result:** Prompts for function name, then searches

---

## 🎓 Tips & Tricks

### Tip 1: Organize by Naming
```
Good names:
✅ "C++ - Import quotes to angles"
✅ "JS - Console.log cleanup"
✅ "Python - TODO to FIXME"

Bad names:
❌ "Pattern 1"
❌ "Regex"
❌ "asdf"
```

### Tip 2: Use Global vs Workspace
```
Global (all projects):
- Generic patterns (TODO to FIXME)
- Language-specific (C++ imports)

Workspace (current project):
- Project-specific (oldClassName → newClassName)
- Temporary refactoring patterns
```

### Tip 3: Test Patterns First
```
Before saving complex regex:
1. Test in Search panel manually
2. Verify it works
3. Then save as pattern
```

---

## 🚨 Common Issues & Solutions

### Issue: Pattern doesn't appear
```
Problem: Saved pattern but don't see it in list

Solutions:
☑ Check settings.json syntax (no missing commas)
☑ Reload VS Code window (Ctrl+Shift+P → "Reload Window")
☑ Verify pattern has all required fields
```

### Issue: Regex doesn't work
```
Problem: Pattern matches wrong things

Solutions:
☑ Set "isRegex": true in flags
☑ Escape special characters: \ ( ) [ ] . * + ?
☑ Test regex at regex101.com first
```

### Issue: Placeholder not prompting
```
Problem: ${prompt:name} shows literally

Solutions:
☑ Use exact syntax: ${prompt:name}
☑ Don't escape: ❌ \\${prompt:...}  ✅ ${prompt:...}
☑ Check for typos in placeholder name
```

---

## 📚 Where to Go Next

**Just Getting Started?**
→ Try the example patterns in `example-settings.json`

**Want to Create Patterns?**
→ See `QUICK_REFERENCE.md` → "How to Create Patterns"

**Need Help?**
→ See `TESTING.md` → "Troubleshooting"

**Ready for Advanced Features?**
→ See `ROADMAP.md` → Future features

**Want to Understand the Code?**
→ See `ARCHITECTURE.md` → System design

---

## 🎊 Success Stories

### Before PatternStore:
```
"I keep forgetting the regex for converting includes..."
"Let me search Stack Overflow again..."
"Was it (.*) or ([^"]+)?"
```

### After PatternStore:
```
"Ctrl+Alt+R → Done!"
"One click, perfect every time!"
"I have 20+ patterns saved now!"
```

---

**Ready to save time? Press `Ctrl+Alt+R` and try it now!** 🚀
