import * as vscode from 'vscode';
import { RegexPattern } from './types';

/**
 * Get the current search state from the Search panel
 * Returns null if unable to get the state
 * 
 * NOTE: VS Code doesn't expose search panel state via API.
 * This function tries to use editor selection as fallback.
 */
export async function getCurrentSearchState(): Promise<Partial<RegexPattern> | null> {
  // Try to get selected text from active editor
  const editor = vscode.window.activeTextEditor;
  const selection = editor?.document.getText(editor.selection);
  
  if (selection && selection.length > 0) {
    // Use selection as find text
    return {
      find: selection,
      replace: '',
      flags: {
        isRegex: false,
        isCaseSensitive: false,
        matchWholeWord: false,
        isMultiline: false
      }
    };
  }
  
  // No selection available - return null
  // User will need to enter manually
  return null;
}

/**
 * Resolve placeholders like ${prompt:varname} in a string
 */
async function resolvePlaceholders(text: string): Promise<string | undefined> {
  const RE = /\$\{prompt:([^}]+)\}/g;
  const names = [...new Set(Array.from(text.matchAll(RE), m => m[1]))];
  const vals: Record<string, string> = {};
  
  for (const name of names) {
    const value = await vscode.window.showInputBox({ 
      prompt: `Value for ${name}`,
      placeHolder: name
    });
    if (value === undefined) {
      return undefined; // User cancelled
    }
    vals[name] = value;
  }
  
  return text.replace(RE, (_, name) => vals[name] ?? "");
}

/**
 * Load a pattern into the Search panel using VS Code's findInFiles command
 */
export async function loadPatternIntoSearch(pattern: RegexPattern): Promise<void> {
  try {
    // Resolve placeholders
    const find = await resolvePlaceholders(pattern.find);
    if (find === undefined) {
      return; // User cancelled
    }
    
    const replace = await resolvePlaceholders(pattern.replace);
    if (replace === undefined) {
      return; // User cancelled
    }
    
    // Use VS Code's built-in command to open search with parameters
    await vscode.commands.executeCommand("workbench.action.findInFiles", {
      query: find,
      replace: replace,
      triggerSearch: false, // Don't auto-trigger search
      isRegex: pattern.flags.isRegex,
      isCaseSensitive: pattern.flags.isCaseSensitive,
      matchWholeWord: pattern.flags.matchWholeWord,
      preserveCase: false,
    });
    
    vscode.window.showInformationMessage(`✅ Loaded pattern: "${pattern.label}"`);
    
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load pattern: ${error}`);
    throw error;
  }
}
