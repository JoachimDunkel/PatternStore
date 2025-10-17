import * as vscode from 'vscode';
import { RegexPattern } from './types';

/**
 * Read all patterns from global and workspace settings
 * Workspace patterns take precedence over global patterns with the same label
 */
export function getAllPatterns(): RegexPattern[] {
  const config = vscode.workspace.getConfiguration('patternStore');
  
  // Get global patterns
  const globalPatterns = config.inspect<RegexPattern[]>('savedPatterns')?.globalValue || [];
  
  // Get workspace patterns
  const workspacePatterns = config.inspect<RegexPattern[]>('workspacePatterns')?.workspaceValue || [];
  
  // Combine patterns, ensuring scope is set correctly
  const global = globalPatterns.map(p => ({ ...p, scope: 'global' as const }));
  const workspace = workspacePatterns.map(p => ({ ...p, scope: 'workspace' as const }));
  
  // Merge: workspace patterns override global ones with same label
  const allPatterns: RegexPattern[] = [...global];
  const globalLabels = new Set(global.map(p => p.label));
  
  for (const wp of workspace) {
    if (globalLabels.has(wp.label)) {
      // Replace global pattern with workspace one
      const idx = allPatterns.findIndex(p => p.label === wp.label);
      if (idx !== -1) {
        allPatterns[idx] = wp;
      }
    } else {
      allPatterns.push(wp);
    }
  }
  
  return allPatterns;
}

/**
 * Get patterns from a specific scope
 */
function getPatternsByScope(scope: 'global' | 'workspace'): RegexPattern[] {
  const config = vscode.workspace.getConfiguration('patternStore');
  
  if (scope === 'global') {
    const patterns = config.inspect<RegexPattern[]>('savedPatterns')?.globalValue || [];
    return patterns.map(p => ({ ...p, scope: 'global' as const }));
  } else {
    const patterns = config.inspect<RegexPattern[]>('workspacePatterns')?.workspaceValue || [];
    return patterns.map(p => ({ ...p, scope: 'workspace' as const }));
  }
}

/**
 * Save a pattern to either global or workspace settings
 */
export async function savePattern(pattern: RegexPattern): Promise<void> {
  const config = vscode.workspace.getConfiguration('patternStore');
  const configKey = pattern.scope === 'global' ? 'savedPatterns' : 'workspacePatterns';
  const target = pattern.scope === 'global' 
    ? vscode.ConfigurationTarget.Global 
    : vscode.ConfigurationTarget.Workspace;
  
  // Get existing patterns
  let patterns = getPatternsByScope(pattern.scope);
  
  // Remove existing pattern with same label if it exists
  patterns = patterns.filter(p => p.label !== pattern.label);
  
  // Add new pattern
  patterns.push(pattern);
  
  // Save to settings
  await config.update(configKey, patterns, target);
  
  vscode.window.showInformationMessage(`✅ Pattern "${pattern.label}" saved to ${pattern.scope} settings`);
}

/**
 * Delete a pattern by label and scope
 */
export async function deletePattern(label: string, scope: 'global' | 'workspace'): Promise<void> {
  const config = vscode.workspace.getConfiguration('patternStore');
  const configKey = scope === 'global' ? 'savedPatterns' : 'workspacePatterns';
  const target = scope === 'global' 
    ? vscode.ConfigurationTarget.Global 
    : vscode.ConfigurationTarget.Workspace;
  
  // Get existing patterns
  let patterns = getPatternsByScope(scope);
  
  // Remove pattern with matching label
  const originalLength = patterns.length;
  patterns = patterns.filter(p => p.label !== label);
  
  if (patterns.length === originalLength) {
    vscode.window.showWarningMessage(`Pattern "${label}" not found in ${scope} settings`);
    return;
  }
  
  // Save updated list
  await config.update(configKey, patterns, target);
  
  vscode.window.showInformationMessage(`🗑️ Pattern "${label}" deleted from ${scope} settings`);
}

/**
 * Rename a pattern
 */
export async function renamePattern(oldLabel: string, newLabel: string, scope: 'global' | 'workspace'): Promise<void> {
  const config = vscode.workspace.getConfiguration('patternStore');
  const configKey = scope === 'global' ? 'savedPatterns' : 'workspacePatterns';
  const target = scope === 'global' 
    ? vscode.ConfigurationTarget.Global 
    : vscode.ConfigurationTarget.Workspace;
  
  // Get existing patterns
  const patterns = getPatternsByScope(scope);
  
  // Find and rename pattern
  const pattern = patterns.find(p => p.label === oldLabel);
  if (!pattern) {
    vscode.window.showWarningMessage(`Pattern "${oldLabel}" not found in ${scope} settings`);
    return;
  }
  
  // Check if new label already exists
  if (patterns.some(p => p.label === newLabel && p.label !== oldLabel)) {
    vscode.window.showErrorMessage(`A pattern named "${newLabel}" already exists in ${scope} settings`);
    return;
  }
  
  // Update label
  pattern.label = newLabel;
  
  // Save updated list
  await config.update(configKey, patterns, target);
  
  vscode.window.showInformationMessage(`✏️ Pattern renamed to "${newLabel}" in ${scope} settings`);
}

/**
 * Check if a pattern with the given label exists
 */
export function patternExists(label: string, scope: 'global' | 'workspace'): boolean {
  const patterns = getPatternsByScope(scope);
  return patterns.some(p => p.label === label);
}
