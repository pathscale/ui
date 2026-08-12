import { recipe } from "solid-layouts";

/**
 * GlassPanel's design vocabulary.
 *
 * The old `flag` map mixed two different things: appearance the caller picks
 * (transparent, tone, highlight, interactive) and state the component
 * computes (collapsed, collapsible, whether the chevron is open). Splitting
 * them is the point of having two axis kinds, and it is what lets the
 * collapsed state mirror to `data-collapsed` instead of only existing as a
 * class on one element.
 *
 * `size` is slot-keyed: its classes are `glass-panel__content--*`, so they
 * belong on the content slot rather than the root.
 */
export const glassPanel = recipe({
  component: "glass-panel",
  element: "div",
  slots: {
    root: { base: "glass-panel" },
    headerButton: { base: "glass-panel__header-button" },
    headerLabel: { base: "glass-panel__header-label" },
    chevron: { base: "glass-panel__chevron" },
    content: { base: "glass-panel__content" },
    contentInner: { base: "glass-panel__content-inner" },
  },
  props: {
    size: {
      xs: { content: "glass-panel__content--xs" },
      sm: { content: "glass-panel__content--sm" },
      md: { content: "glass-panel__content--md" },
      lg: { content: "glass-panel__content--lg" },
      xl: { content: "glass-panel__content--xl" },
    },
    transparent: { true: "glass-panel--transparent" },
    toneSecondary: { true: "glass-panel--tone-secondary" },
    highlight: { true: "glass-panel--highlight" },
    interactive: { true: "glass-panel--interactive" },
  },
  state: {
    collapsed: {
      true: {
        content: "glass-panel__content--collapsed",
        contentInner: "glass-panel__content-inner--hidden",
      },
    },
    collapsible: { true: { content: "glass-panel__content--collapsible" } },
    open: { true: { chevron: "glass-panel__chevron--open" } },
  },
});
