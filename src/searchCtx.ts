import * as vscode from 'vscode';
import { RegexPattern } from './types';

/**
 * Get the current search state from the Search panel
 * Returns null if unable to get the state
 */
export async function getCurrentSearchState(): Promise<Partial<RegexPattern> | null> {
  // TODO: Implement getting current search state
  // This is tricky - VS Code doesn't expose search panel state directly
  console.log('[SearchCtx] getCurrentSearchState called');
  
  // For now, return dummy data
  vscode.window.showInformationMessage('Getting current search state (not implemented yet)');
  return {
    find: 'example-find',
    replace: 'example-replace',
    flags: {
      isRegex: true,
      isCaseSensitive: false,
      matchWholeWord: false,
      isMultiline: false
    }
  };
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
 * Load a pattern into the Search panel
 */
export async function loadPatternIntoSearch(pattern: RegexPattern): Promise<void> {
  console.log('[SearchCtx] loadPatternIntoSearch called:', pattern.label);
  
  // Resolve placeholders
  const find = await resolvePlaceholders(pattern.find);
  if (find === undefined) {
    return; // User cancelled
  }
  
  const replace = await resolvePlaceholders(pattern.replace);
  if (replace === undefined) {
    return; // User cancelled
  }
  
  // TODO: Use the actual VS Code command to open search with parameters
  vscode.window.showInformationMessage(
    `Would load pattern "${pattern.label}" into search (not implemented yet)\nFind: ${find}\nReplace: ${replace}`
  );
  
  // This is the command we'll use when implementing:
  // await vscode.commands.executeCommand("workbench.action.findInFiles", {
  //   query: find,
  //   replace: replace,
  //   triggerSearch: false,
  //   isRegex: pattern.flags.isRegex,
  //   isCaseSensitive: pattern.flags.isCaseSensitive,
  //   matchWholeWord: pattern.flags.matchWholeWord,
  //   preserveCase: false,
  // });
}
