export const CLASSES = {
  Root: {
    base: "menu",
  },
  Item: {
    base: "menu-item",
    variant: {
      default: "menu-item--default",
      danger: "menu-item--danger",
    },
  },
  ItemIndicator: {
    base: "menu-item__indicator",
    submenu: "menu-item__indicator--submenu",
  },
  Section: {
    base: "menu-section",
    title: "menu-section__title",
  },
} as const;
