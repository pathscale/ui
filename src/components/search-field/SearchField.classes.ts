export const CLASSES = {
  Root: {
    base: "search-field",
    variant: {
      primary: "search-field--primary",
      secondary: "search-field--secondary",
    },
    flag: {
      fullWidth: "search-field--full-width",
    },
  },
  Group: {
    base: "search-field__group",
    flag: {
      fullWidth: "search-field__group--full-width",
    },
  },
  Input: {
    base: "search-field__input",
  },
  SearchIcon: {
    base: "search-field__search-icon",
  },
  ClearButton: {
    base: "search-field__clear-button",
  },
} as const;
