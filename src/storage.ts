import * as vscode from 'vscode';
import { RegexPattern } from './types';

/**
 * Read all patterns from global and workspace settings
 */
export function getAllPatterns(): RegexPattern[] {
  // TODO: Implement reading from settings
  console.log('[Storage] getAllPatterns called');
  return [];
}

/**
 * Save a pattern to either global or workspace settings
 */
export async function savePattern(pattern: RegexPattern): Promise<void> {
  // TODO: Implement saving to settings
  console.log('[Storage] savePattern called:', pattern.label);
  vscode.window.showInformationMessage(`Pattern "${pattern.label}" would be saved (not implemented yet)`);
}

/**
 * Delete a pattern by label and scope
 */
export async function deletePattern(label: string, scope: 'global' | 'workspace'): Promise<void> {
  // TODO: Implement deletion
  console.log('[Storage] deletePattern called:', label, scope);
  vscode.window.showInformationMessage(`Pattern "${label}" would be deleted (not implemented yet)`);
}

/**
 * Rename a pattern
 */
export async function renamePattern(oldLabel: string, newLabel: string, scope: 'global' | 'workspace'): Promise<void> {
  // TODO: Implement rename
  console.log('[Storage] renamePattern called:', oldLabel, '->', newLabel);
  vscode.window.showInformationMessage(`Pattern "${oldLabel}" would be renamed to "${newLabel}" (not implemented yet)`);
}

/**
 * Check if a pattern with the given label exists
 */
export function patternExists(label: string, scope: 'global' | 'workspace'): boolean {
  // TODO: Implement check
  return false;
}
