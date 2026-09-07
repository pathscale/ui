import { recipe } from "../../lib/layouts";

/**
 * The root class, owned here.
 *
 * Text's presentation axes stay `data-*` attributes rather than becoming recipe
 * `props`, and deliberately: `Text.css` selects on `[data-size]`, `[data-variant]`
 * and the rest, so turning them into recipe props would emit classes nothing
 * styles. Recipe `props` map a value to a class; these map a value to an
 * attribute, which is what `state` is for -- except these are set at the call
 * site, not computed.
 *
 * So the only thing that was manual here is the base class, and that is what
 * moves: the layout spreads `{...slot.root}` instead of calling `twMerge`.
 */
export const componentRecipe = recipe({
  component: "text",
  element: "span",
  slots: {
    root: { base: "text" },
  },
});
