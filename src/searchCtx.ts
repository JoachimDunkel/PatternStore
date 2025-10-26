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
 * Resolve placeholders like ${prompt:varname} in multiple strings
 * Prompts once per unique placeholder name and reuses the value
 */
async function resolvePlaceholdersMultiple(texts: string[]): Promise<string[] | undefined> {
  const RE = /\$\{prompt:([^}]+)\}/g;

  // Collect all unique placeholder names across all texts
  const allNames = new Set<string>();
  for (const text of texts) {
    Array.from(text.matchAll(RE), m => m[1]).forEach(name => allNames.add(name));
  }

  const vals: Record<string, string> = {};

  // Prompt once for each unique placeholder
  for (const name of allNames) {
    const value = await vscode.window.showInputBox({
      prompt: `Value for ${name}`,
      placeHolder: name
    });
    if (value === undefined) {
      return undefined; // User cancelled
    }
    vals[name] = value;
  }

  // Replace placeholders in all texts using the collected values
  return texts.map(text => text.replace(RE, (_, name) => vals[name] ?? ""));
}

/**
 * Resolve placeholders like ${prompt:varname} in a string (single text version)
 */
async function resolvePlaceholders(text: string): Promise<string | undefined> {
  const result = await resolvePlaceholdersMultiple([text]);
  return result ? result[0] : undefined;
}

export async function loadPatternIntoSearch(pattern: RegexPattern): Promise<void> {
  try {
    const hasReplace = pattern.replace && pattern.replace.trim().length > 0;

    const textsToResolve = hasReplace ? [pattern.find, pattern.replace!] : [pattern.find];
    const resolved = await resolvePlaceholdersMultiple(textsToResolve);

    if (!resolved) {
      return; // User cancelled
    }

    const find = resolved[0];
    const replace = hasReplace ? resolved[1] : '';

    const commandArgs: any = {
      query: find,
      replace: replace,
      triggerSearch: false, // Don't auto-trigger search
      isRegex: pattern.flags.isRegex,
      isCaseSensitive: pattern.flags.isCaseSensitive,
      matchWholeWord: pattern.flags.matchWholeWord,
      preserveCase: false,
      filesToInclude: pattern.filesToInclude || '',
      filesToExclude: pattern.filesToExclude || ''
    };


    await vscode.commands.executeCommand("workbench.action.findInFiles", commandArgs);

    vscode.window.showInformationMessage(`✅ Loaded pattern: "${pattern.label}"`);

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load pattern: ${error}`);
    throw error;
  }
}
