export const CLASSES = {
  base: "glass-panel",
  size: {
    xs: "glass-panel__content--xs",
    sm: "glass-panel__content--sm",
    md: "glass-panel__content--md",
    lg: "glass-panel__content--lg",
    xl: "glass-panel__content--xl",
  },
  flag: {
    transparent: "glass-panel--transparent",
    contentCollapsed: "glass-panel__content--collapsed",
    contentCollapsible: "glass-panel__content--collapsible",
    contentInnerHidden: "glass-panel__content-inner--hidden",
    chevronOpen: "glass-panel__chevron--open",
  },
  slot: {
    headerButton: "glass-panel__header-button",
    headerLabel: "glass-panel__header-label",
    chevron: "glass-panel__chevron",
    content: "glass-panel__content",
    contentInner: "glass-panel__content-inner",
  },
} as const;
