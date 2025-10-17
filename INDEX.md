# 📚 PatternStore - Documentation Index

Welcome to PatternStore! Use this index to find what you need.

## 🚀 Getting Started

**New to PatternStore? Start here:**

1. **[README.md](README.md)** - Overview and quick start guide
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands, shortcuts, and examples
3. **[example-settings.json](example-settings.json)** - Ready-to-use patterns

**Quick Start:**
- Press `Ctrl+Alt+R` to load a pattern
- See `QUICK_REFERENCE.md` for all commands

---

## 📖 Documentation Files

### User Documentation
| File | Purpose | When to Read |
|------|---------|--------------|
| **[README.md](README.md)** | Main overview, features, examples | First time setup |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Commands, shortcuts, usage tips | Daily reference |
| **[example-settings.json](example-settings.json)** | Sample patterns to copy | Creating patterns |

### Developer Documentation
| File | Purpose | When to Read |
|------|---------|--------------|
| **[ROADMAP.md](ROADMAP.md)** | Future features, implementation plan | Next coding session |
| **[NEXT_SESSION.md](NEXT_SESSION.md)** | **START HERE for next session!** Step-by-step guide | Before next session |
| **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** | What we built today | Review session results |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, data flow diagrams | Understanding architecture |
| **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** | Current status, what works | Understanding current state |
| **[TESTING.md](TESTING.md)** | How to test the extension | Testing & debugging |
| **[project-specs.md](project-specs.md)** | Original specifications | Understanding requirements |

### Technical Notes
| File | Purpose | When to Read |
|------|---------|--------------|
| **[FEATURE_UPDATE.md](FEATURE_UPDATE.md)** | Optional replace & placeholders | Recent feature changes |
| **[PLACEHOLDER_FIXES.md](PLACEHOLDER_FIXES.md)** | Placeholder system fixes | Understanding placeholders |
| **[CHANGELOG.md](CHANGELOG.md)** | Version history | Tracking changes |

---

## 🗂️ Source Code Structure

```
src/
├── extension.ts     - Main entry point, command registration
├── types.ts         - TypeScript interfaces (RegexPattern)
├── storage.ts       - Settings.json read/write operations
└── searchCtx.ts     - Search panel integration, placeholder resolution
```

**Key Functions:**
- `storage.getAllPatterns()` - Get all patterns from settings
- `storage.savePattern()` - Save pattern to settings
- `searchCtx.loadPatternIntoSearch()` - Load pattern into search panel

---

## 📋 Quick Links by Task

### I want to...

**Use the extension:**
→ `README.md` or `QUICK_REFERENCE.md`

**Create a pattern:**
→ `QUICK_REFERENCE.md` → "How to Create Patterns Manually"

**Understand what works:**
→ `SESSION_SUMMARY.md` → "Testing Results"

**See example patterns:**
→ `example-settings.json`

**Plan next development:**
→ `ROADMAP.md` → "Priority Features"

**Test the extension:**
→ `TESTING.md`

**Understand placeholders:**
→ `PLACEHOLDER_FIXES.md` or `QUICK_REFERENCE.md` → "Placeholders"

**See what changed:**
→ `CHANGELOG.md`

**Debug issues:**
→ `TESTING.md` → "Troubleshooting"

**Contribute:**
→ `ROADMAP.md` → "Next Session Action Plan"

---

## 🎯 Next Session Checklist

Before starting next session:

- [ ] **Read `NEXT_SESSION.md` FIRST** - Complete step-by-step guide
- [ ] Read `ROADMAP.md` for feature overview
- [ ] Review `ARCHITECTURE.md` for system design
- [ ] Check `SESSION_SUMMARY.md` for what we built
- [ ] Prepare development environment (`npm install`, `npm run compile`)

**Primary Goal:** Implement Save Pattern webview dialog

**Time Estimate:** 90 minutes

**Start Here:** `NEXT_SESSION.md` → "Before You Start"

---

## 💡 Common Questions

### Where do I add patterns?
→ `QUICK_REFERENCE.md` → "How to Create Patterns Manually"

### What's the keyboard shortcut?
→ `Ctrl+Alt+R` for Load Pattern (see `QUICK_REFERENCE.md`)

### How do placeholders work?
→ Use `${prompt:name}` in pattern (see `PLACEHOLDER_FIXES.md`)

### Can I create find-only patterns?
→ Yes! Omit the `replace` field (see `QUICK_REFERENCE.md` → "Find-Only Pattern")

### How do I test my changes?
→ `npm run compile` then press `F5` (see `TESTING.md`)

### What's coming next?
→ `ROADMAP.md` → "Priority Features"

---

## 📞 Support & Resources

**Documentation Issues?**
Check the file index above or search in the document.

**Code Issues?**
See `TESTING.md` → "Troubleshooting"

**Want to Contribute?**
Start with `ROADMAP.md` for planned features

---

## 🎊 Status Overview

**Version:** 0.1.0  
**Status:** ✅ Core features working, ready for enhancements  
**Last Updated:** 2025-10-17

**What Works:**
- ✅ Load patterns
- ✅ Manage patterns  
- ✅ Placeholders
- ✅ Optional replace

**What's Next:**
- 🎨 Save Pattern webview
- 📁 File scope filters

See `SESSION_SUMMARY.md` for complete status!

---

**Happy Coding! 🚀**
