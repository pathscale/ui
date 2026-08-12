import { recipe } from "solid-layouts";

/**
 * `itemSelected` was a sibling of `item` in the old flat map, two names for
 * one element in two states. As a state axis it reaches the item slot and
 * mirrors to `data-selected`.
 */
export const languageSwitcher = recipe({
  component: "language-switcher",
  element: "div",
  slots: {
    root: { base: "language-switcher" },
    trigger: { base: "language-switcher__trigger" },
    loadingIcon: { base: "language-switcher__loading-icon" },
    locale: { base: "language-switcher__locale" },
    menu: { base: "language-switcher__menu" },
    item: { base: "language-switcher__item" },
  },
  state: {
    selected: { true: { item: "language-switcher__item--selected" } },
  },
});
