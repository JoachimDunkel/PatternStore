import * as vscode from 'vscode';
import { RegexPattern } from './types';
import * as C from './constants';
import { v4 as uuidv4 } from 'uuid';


function ensurePatternIds(patterns: RegexPattern[]): { patterns: RegexPattern[], idsAdded: boolean } {
  let idsAdded = false;
  const withIds = patterns.map(p => {
    if (!p.id) {
      idsAdded = true;
      return { ...p, id: uuidv4() };
    }
    return p;
  });
  return { patterns: withIds, idsAdded };
}

function getPatternsByScope(scope: 'global' | 'workspace'): RegexPattern[] {
  const config = vscode.workspace.getConfiguration(C.CONFIG_NAMESPACE);
  const configKey = scope === 'global' ? C.CONFIG_KEY_USER_PATTERNS : C.CONFIG_KEY_WORKSPACE_PATTERNS;
  const target = scope === 'global'
    ? vscode.ConfigurationTarget.Global
    : vscode.ConfigurationTarget.Workspace;

  let patterns: RegexPattern[];
  if (scope === 'global') {
    patterns = config.inspect<RegexPattern[]>(C.CONFIG_KEY_USER_PATTERNS)?.globalValue || [];
  } else {
    patterns = config.inspect<RegexPattern[]>(C.CONFIG_KEY_WORKSPACE_PATTERNS)?.workspaceValue || [];
  }

  // Add scope and ensure all have IDs
  patterns = patterns.map(p => ({ ...p, scope: scope as const }));
  const { patterns: withIds, idsAdded } = ensurePatternIds(patterns);

  // If we added any IDs, save back to settings immediately
  if (idsAdded) {
    config.update(configKey, withIds, target);
  }

  return withIds;
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

  // Read fresh from disk
  let patterns = getPatternsByScope(pattern.scope);

  // Ensure pattern has an ID
  if (!pattern.id) {
    pattern.id = uuidv4();
  }

  // Find by ID
  const existingIndex = patterns.findIndex(p => p.id === pattern.id);
  const isUpdate = existingIndex !== -1;

  if (isUpdate) {
    // Update existing pattern IN PLACE (maintains order)
    patterns[existingIndex] = pattern;
  } else {
    // New pattern - add at beginning
    patterns.unshift(pattern);
  }

  // Save to settings
  await config.update(configKey, patterns, target);

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

  // Read fresh from disk
  let patterns = getPatternsByScope(scope);

  // Find pattern to get label for message
  const pattern = patterns.find(p => p.id === id);

  // Remove pattern with matching ID
  const originalLength = patterns.length;
  patterns = patterns.filter(p => p.id !== id);

  if (patterns.length === originalLength) {
    vscode.window.showWarningMessage(`Pattern not found in ${scope} settings`);
    return;
  }

  // Save updated list
  await config.update(configKey, patterns, target);

  if (pattern) {
    vscode.window.showInformationMessage(`🗑️ Pattern "${pattern.label}" deleted from ${scope} settings`);
  }
}

export async function renamePattern(id: string, newLabel: string, scope: 'global' | 'workspace'): Promise<void> {
  const config = vscode.workspace.getConfiguration(C.CONFIG_NAMESPACE);
  const configKey = scope === 'global' ? C.CONFIG_KEY_USER_PATTERNS : C.CONFIG_KEY_WORKSPACE_PATTERNS;
  const target = scope === 'global'
    ? vscode.ConfigurationTarget.Global
    : vscode.ConfigurationTarget.Workspace;

  // Read fresh from disk
  const patterns = getPatternsByScope(scope);

  // Find and rename pattern by ID
  const pattern = patterns.find(p => p.id === id);
  if (!pattern) {
    vscode.window.showWarningMessage(`Pattern not found in ${scope} settings`);
    return;
  }

  const oldLabel = pattern.label;
  pattern.label = newLabel;

  // Save updated list
  await config.update(configKey, patterns, target);

  vscode.window.showInformationMessage(`✏️ Pattern renamed from "${oldLabel}" to "${newLabel}" in ${scope} settings`);
}

export function patternExists(label: string, scope: 'global' | 'workspace'): boolean {
  const patterns = getPatternsByScope(scope);
  return patterns.some(p => p.label === label);
}