import * as vscode from 'vscode';
import { RegexPattern, StoredPattern } from './types';
import * as C from './constants';

/**
 * Get patterns from settings and add runtime IDs
 */
function getPatternsByScope(scope: 'global' | 'workspace'): RegexPattern[] {
  const config = vscode.workspace.getConfiguration(C.CONFIG_NAMESPACE);
  const configKey = scope === 'global' ? C.CONFIG_KEY_USER_PATTERNS : C.CONFIG_KEY_WORKSPACE_PATTERNS;

  let storedPatterns: StoredPattern[];
  if (scope === 'global') {
    storedPatterns = config.inspect<StoredPattern[]>(C.CONFIG_KEY_USER_PATTERNS)?.globalValue || [];
  } else {
    storedPatterns = config.inspect<StoredPattern[]>(C.CONFIG_KEY_WORKSPACE_PATTERNS)?.workspaceValue || [];
  }

  // Add runtime IDs and ensure scope is set
  return storedPatterns.map((p, index) => ({
    ...p,
    id: `${scope}-${index}`, // Index-based runtime ID
    scope: scope
  }));
}

export function getAllPatterns(): RegexPattern[] {
  const workspace = getPatternsByScope('workspace');
  const global = getPatternsByScope('global');

  // Return all patterns - duplicates across scopes are allowed
  return [...workspace, ...global];
}

export async function savePattern(pattern: RegexPattern): Promise<void> {
  const config = vscode.workspace.getConfiguration(C.CONFIG_NAMESPACE);
  const configKey = pattern.scope === 'global' ? C.CONFIG_KEY_USER_PATTERNS : C.CONFIG_KEY_WORKSPACE_PATTERNS;
  const target = pattern.scope === 'global'
    ? vscode.ConfigurationTarget.Global
    : vscode.ConfigurationTarget.Workspace;

  // Read fresh patterns with runtime IDs
  const patternsWithIds = getPatternsByScope(pattern.scope);

  // Find existing pattern by ID (runtime ID tells us the index it came from)
  const existingIndex = patternsWithIds.findIndex(p => p.id === pattern.id);
  const isUpdate = existingIndex !== -1;

  // Strip runtime ID before saving
  const { id, ...storedPattern } = pattern;

  // Create array of stored patterns (without IDs)
  let storedPatterns: StoredPattern[] = patternsWithIds.map(p => {
    const { id, ...stored } = p;
    return stored;
  });

  if (isUpdate) {
    // Update existing pattern IN PLACE (maintains order)
    storedPatterns[existingIndex] = storedPattern;
  } else {
    // New pattern - add at beginning
    storedPatterns.unshift(storedPattern);
  }

  // Save to settings (without IDs)
  await config.update(configKey, storedPatterns, target);

  // Only show message if it's a new pattern (not an update)
  if (!isUpdate) {
    vscode.window.showInformationMessage(`✅ Pattern "${pattern.label}" saved to ${pattern.scope} settings`);
  }
}

export async function deletePattern(id: string, scope: 'global' | 'workspace'): Promise<void> {
  const config = vscode.workspace.getConfiguration(C.CONFIG_NAMESPACE);
  const configKey = scope === 'global' ? C.CONFIG_KEY_USER_PATTERNS : C.CONFIG_KEY_WORKSPACE_PATTERNS;
  const target = scope === 'global'
    ? vscode.ConfigurationTarget.Global
    : vscode.ConfigurationTarget.Workspace;

  // Read fresh patterns with runtime IDs
  const patternsWithIds = getPatternsByScope(scope);

  // Find pattern by runtime ID
  const patternToDelete = patternsWithIds.find(p => p.id === id);

  if (!patternToDelete) {
    vscode.window.showWarningMessage(`Pattern not found in ${scope} settings`);
    return;
  }

  // Filter out the pattern and strip IDs
  const storedPatterns: StoredPattern[] = patternsWithIds
    .filter(p => p.id !== id)
    .map(p => {
      const { id, ...stored } = p;
      return stored;
    });

  // Save updated list (without IDs)
  await config.update(configKey, storedPatterns, target);

  vscode.window.showInformationMessage(`🗑️ Pattern "${patternToDelete.label}" deleted from ${scope} settings`);
}

export async function renamePattern(id: string, newLabel: string, scope: 'global' | 'workspace'): Promise<void> {
  const config = vscode.workspace.getConfiguration(C.CONFIG_NAMESPACE);
  const configKey = scope === 'global' ? C.CONFIG_KEY_USER_PATTERNS : C.CONFIG_KEY_WORKSPACE_PATTERNS;
  const target = scope === 'global'
    ? vscode.ConfigurationTarget.Global
    : vscode.ConfigurationTarget.Workspace;

  // Read fresh patterns with runtime IDs
  const patternsWithIds = getPatternsByScope(scope);

  // Find pattern by runtime ID
  const pattern = patternsWithIds.find(p => p.id === id);
  if (!pattern) {
    vscode.window.showWarningMessage(`Pattern not found in ${scope} settings`);
    return;
  }

  const oldLabel = pattern.label;

  // Update label and strip IDs for saving
  const storedPatterns: StoredPattern[] = patternsWithIds.map(p => {
    const { id: _id, ...stored } = p;
    if (p.id === id) {
      return { ...stored, label: newLabel };
    }
    return stored;
  });

  // Save updated list (without IDs)
  await config.update(configKey, storedPatterns, target);

  vscode.window.showInformationMessage(`✏️ Pattern renamed from "${oldLabel}" to "${newLabel}" in ${scope} settings`);
}

export function patternExists(label: string, scope: 'global' | 'workspace'): boolean {
  const patterns = getPatternsByScope(scope);
  return patterns.some(p => p.label === label);
}