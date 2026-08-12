import { recipe } from "solid-layouts";

/**
 * Kbd's design vocabulary.
 *
 * The old `CLASSES.slot` map is now real slots. That is the difference that
 * matters: a slot is declared, indexed by the compiler, and carries its own
 * `data-slot`, where the old map was a bag of strings the component spread by
 * hand with nothing checking a typo.
 */
export const kbd = recipe({
  component: "kbd",
  element: "kbd",
  slots: {
    root: { base: "kbd" },
    abbr: { base: "kbd__abbr" },
    content: { base: "kbd__content" },
  },
  props: {
    variant: {
      default: "kbd--default",
      light: "kbd--light",
    },
  },
});
