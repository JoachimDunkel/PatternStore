/**
 * Represents a saved regex pattern with find/replace and flags
 */
export interface RegexPattern {
  /** Unique label within scope */
  label: string;
  /** Raw regex source or plain text find string */
  find: string;
  /** Replacement string (may contain placeholders like ${prompt:name}) */
  replace: string;
  /** Search flags */
  flags: {
    isRegex: boolean;
    isCaseSensitive: boolean;
    matchWholeWord: boolean;
    isMultiline: boolean;
  };
  /** Storage scope */
  scope: "global" | "workspace";
}
