/**
 * Represents a saved regex pattern with find/replace and flags
 */
export interface RegexPattern {
  /** Unique label within scope */
  label: string;
  /** Raw regex source or plain text find string */
  find: string;
  /** Replacement string (may contain placeholders like ${prompt:name}). Optional - if omitted, only find is performed. */
  replace?: string;
  /** Search flags */
  flags: {
    isRegex: boolean;
    isCaseSensitive: boolean;
    matchWholeWord: boolean;
    isMultiline: boolean;
  };
  /** Files to include (glob pattern, e.g. "*.ts,*.js" or "src/**") */
  filesToInclude?: string;
  /** Files to exclude (glob pattern, e.g. "node_modules/**,dist/**") */
  filesToExclude?: string;
  /** Storage scope */
  scope: "global" | "workspace";
}
