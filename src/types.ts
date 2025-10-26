
/**
 * Pattern as stored in settings.json (no runtime ID)
 */
export interface StoredPattern {
  label: string;
  find: string;
  replace?: string;
  flags: {
    isRegex: boolean;
    isCaseSensitive: boolean;
    matchWholeWord: boolean;
    isMultiline: boolean;
  };
  filesToInclude?: string;
  filesToExclude?: string;
  scope: "global" | "workspace";
}

/**
 * Pattern with runtime ID (used in memory only)
 */
export interface RegexPattern extends StoredPattern {
  id: string; // Generated at runtime: `${scope}-${index}`
}
