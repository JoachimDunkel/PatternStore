
export const CONFIG_NAMESPACE = 'patternStore';
export const CONFIG_KEY_USER_PATTERNS = 'savedPatterns';
export const CONFIG_KEY_WORKSPACE_PATTERNS = 'workspacePatterns';

export const SCOPE_GLOBAL = 'global';
export const SCOPE_WORKSPACE = 'workspace';

export const COMMAND_MANAGE = 'patternStore.manage';

export const MSG_TYPE_READY = 'ready';
export const MSG_TYPE_PATTERNS = 'patterns';
export const MSG_TYPE_DELETE = 'delete';
export const MSG_TYPE_LOAD = 'load';
export const MSG_TYPE_SAVE = 'save';

export const UI_NO_PATTERNS = 'No patterns yet';
export const UI_NO_PATTERNS_FOUND = 'No patterns found';
export const UI_SECTION_WORKSPACE = 'Workspace';
export const UI_SECTION_USER = 'User';
export const UI_MANAGE_TITLE = 'Manage Patterns';

export const ERR_NO_SEARCH_STATE = 'Could not read current search state';
export const ERR_PATTERN_NAME_EMPTY = 'Pattern name cannot be empty';
export const ERR_SAVING_PATTERN = 'Error saving pattern';
export const ERR_LOADING_PATTERN = 'Error loading pattern';
export const ERR_MANAGING_PATTERNS = 'Error managing patterns';

export const INFO_NO_PATTERNS = 'No saved patterns found. Use "PatternStore: Save Pattern" to create one.';
export const INFO_PATTERN_LOADED = 'Loaded pattern';
export const INFO_PATTERN_SAVED = 'Pattern saved';
export const INFO_PATTERN_DELETED = 'Pattern deleted';

export const PROMPT_PATTERN_NAME = 'Enter a name for this pattern';
export const PROMPT_PATTERN_NAME_PLACEHOLDER = 'e.g., "Replace quotes with angles"';
export const PROMPT_SELECT_SCOPE = 'Choose storage scope';
export const PROMPT_SELECT_PATTERN = 'Select a pattern to load';
export const PROMPT_CONFIRM_DELETE = 'Delete pattern';
export const PROMPT_CONFIRM_OVERWRITE = 'already exists. Overwrite?';

export const CHOICE_GLOBAL_LABEL = 'Global';
export const CHOICE_GLOBAL_DESC = 'Available in all workspaces';
export const CHOICE_WORKSPACE_LABEL = 'Workspace';
export const CHOICE_WORKSPACE_DESC = 'Only for this workspace';
