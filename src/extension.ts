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
 * Command: Manage (rename/delete) patterns
 */
async function managePatternsCommand(): Promise<void> {
  try {
    // Get all patterns
    const patterns = storage.getAllPatterns();
    
    if (patterns.length === 0) {
      vscode.window.showInformationMessage('No saved patterns found.');
      return;
    }
    
    // Create QuickPick items with action icons
    const items = patterns.map(p => ({
      label: `$(edit) ${p.label}`,
      description: `[${p.scope}]`,
      detail: `Find: ${p.find.substring(0, 50)}${p.find.length > 50 ? '...' : ''}`,
      pattern: p
    }));
    
    // Show QuickPick
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a pattern to manage'
    });
    
    if (!selected) {
      return; // User cancelled
    }
    
    // Ask what to do
    const action = await vscode.window.showQuickPick(
      [
        { label: '$(edit) Rename', value: 'rename' },
        { label: '$(trash) Delete', value: 'delete' }
      ],
      { placeHolder: `What would you like to do with "${selected.pattern.label}"?` }
    );
    
    if (!action) {
      return; // User cancelled
    }
    
    if (action.value === 'delete') {
      // Confirm deletion
      const confirm = await vscode.window.showWarningMessage(
        `Delete pattern "${selected.pattern.label}"?`,
        'Yes', 'No'
      );
      if (confirm === 'Yes') {
        await storage.deletePattern(selected.pattern.label, selected.pattern.scope);
      }
    } else if (action.value === 'rename') {
      // Prompt for new name
      const newLabel = await vscode.window.showInputBox({
        prompt: 'Enter new name for this pattern',
        value: selected.pattern.label,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Pattern name cannot be empty';
          }
          return null;
        }
      });
      
      if (newLabel && newLabel !== selected.pattern.label) {
        await storage.renamePattern(selected.pattern.label, newLabel.trim(), selected.pattern.scope);
      }
    }
    
  } catch (error) {
    vscode.window.showErrorMessage(`Error managing patterns: ${error}`);
  }
}
