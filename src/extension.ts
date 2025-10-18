import * as vscode from 'vscode';
import { RegexPattern } from './types';
import * as storage from './storage';
import * as searchCtx from './searchCtx';

/**
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('PatternStore extension is now active!');

  // Register command: Save Pattern
  const saveCommand = vscode.commands.registerCommand('patternStore.save', async () => {
    await savePatternCommand();
  });

  // Register command: Load Pattern
  const loadCommand = vscode.commands.registerCommand('patternStore.load', async () => {
    await loadPatternCommand();
  });

  // Register command: Manage Patterns
  const manageCommand = vscode.commands.registerCommand('patternStore.manage', async () => {
    await managePatternsCommand();
  });

  context.subscriptions.push(saveCommand, loadCommand, manageCommand);
}

/**
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log('PatternStore extension is now deactivated');
}

/**
 * Command: Save the current search state as a pattern
 */
async function savePatternCommand(): Promise<void> {
  try {
    vscode.window.showInformationMessage('PatternStore: Save Pattern command executed!');
    
    // Get current search state
    const searchState = await searchCtx.getCurrentSearchState();
    if (!searchState) {
      vscode.window.showErrorMessage('Could not read current search state');
      return;
    }
    
    // Prompt for pattern name
    const label = await vscode.window.showInputBox({
      prompt: 'Enter a name for this pattern',
      placeHolder: 'e.g., "Replace quotes with angles"',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Pattern name cannot be empty';
        }
        return null;
      }
    });
    
    if (!label) {
      return; // User cancelled
    }
    
    // Ask for scope
    const scopeChoice = await vscode.window.showQuickPick(
      [
        { label: 'Global', description: 'Available in all workspaces', value: 'global' },
        { label: 'Workspace', description: 'Only for this workspace', value: 'workspace' }
      ],
      { placeHolder: 'Choose storage scope' }
    );
    
    if (!scopeChoice) {
      return; // User cancelled
    }
    
    // Create pattern object
    const pattern: RegexPattern = {
      label: label.trim(),
      find: searchState.find || '',
      replace: searchState.replace || '',
      flags: searchState.flags || {
        isRegex: false,
        isCaseSensitive: false,
        matchWholeWord: false,
        isMultiline: false
      },
      scope: scopeChoice.value as 'global' | 'workspace'
    };
    
    // Check if pattern exists (will check when we implement storage)
    const exists = storage.patternExists(pattern.label, pattern.scope);
    if (exists) {
      const overwrite = await vscode.window.showWarningMessage(
        `A pattern named "${pattern.label}" already exists. Overwrite?`,
        'Yes', 'No'
      );
      if (overwrite !== 'Yes') {
        return;
      }
    }
    
    // Save pattern
    await storage.savePattern(pattern);
    
  } catch (error) {
    vscode.window.showErrorMessage(`Error saving pattern: ${error}`);
  }
}

/**
 * Command: Load a saved pattern into the search panel
 */
async function loadPatternCommand(): Promise<void> {
  try {
    // Get all patterns
    const patterns = storage.getAllPatterns();
    
    if (patterns.length === 0) {
      vscode.window.showInformationMessage('No saved patterns found. Use "PatternStore: Save Pattern" to create one.');
      return;
    }
    
    // Create QuickPick items
    const items = patterns.map(p => ({
      label: p.label,
      description: `[${p.scope}]`,
      detail: `Find: ${p.find.substring(0, 50)}${p.find.length > 50 ? '...' : ''}`,
      pattern: p
    }));
    
    // Show QuickPick
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a pattern to load'
    });
    
    if (!selected) {
      return; // User cancelled
    }
    
    // Load the pattern into search
    await searchCtx.loadPatternIntoSearch(selected.pattern);
    
  } catch (error) {
    vscode.window.showErrorMessage(`Error loading pattern: ${error}`);
  }
}

/**
 * Command: Manage saved patterns (will be replaced with webview)
 */
async function managePatternsCommand(): Promise<void> {
  console.log('Manage Patterns command pressed - webview will be implemented here');
  vscode.window.showInformationMessage('Manage Patterns pressed (webview coming soon)');
}
