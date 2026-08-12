import { recipe } from "solid-layouts";

/**
 * Avatar's design vocabulary.
 *
 * `color` is slot-keyed rather than a bare string: it tints the fallback, not
 * the avatar. Written as a string it would have landed on the root, which is
 * the mistake the old `CLASSES.color` map invited by naming the values
 * `avatar__fallback--*` while sitting beside the root's own axes.
 */
export const avatar = recipe({
  component: "avatar",
  element: "div",
  slots: {
    root: { base: "avatar" },
    image: { base: "avatar__image" },
    fallback: { base: "avatar__fallback" },
  },
  props: {
    size: { sm: "avatar--sm", md: "", lg: "avatar--lg" },
    variant: { default: "", soft: "avatar--soft" },
    color: {
      default: { fallback: "avatar__fallback--default" },
      accent: { fallback: "avatar__fallback--accent" },
      success: { fallback: "avatar__fallback--success" },
      warning: { fallback: "avatar__fallback--warning" },
      danger: { fallback: "avatar__fallback--danger" },
    },
  },
});
