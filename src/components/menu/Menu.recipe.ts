import { recipe } from "solid-layouts";

/**
 * Menu, ListBox, Dropdown and Select are the four that share
 * `sortItemsByDomOrder` and a hand-rolled roving tabindex between them. The
 * recipes are the presentational half of untangling that; the shared
 * behaviour is the other half and is not addressed here.
 */
export const menu = recipe({
  component: "menu",
  element: "div",
  slots: {
    root: { base: "menu" },
    item: { base: "menu-item" },
    itemIndicator: { base: "menu-item__indicator" },
    section: { base: "menu-section" },
    sectionTitle: { base: "menu-section__title" },
  },
  props: {
    itemVariant: {
      default: { item: "menu-item--default" },
      danger: { item: "menu-item--danger" },
    },
  },
  state: {
    submenu: { true: { itemIndicator: "menu-item__indicator--submenu" } },
  },
});
