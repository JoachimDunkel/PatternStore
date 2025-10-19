
export interface RegexPattern {
  id?: string;
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
