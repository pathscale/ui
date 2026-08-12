import "./Separator.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";
import type { PropsOf } from "solid-layouts";

import defaults from "./Separator.defaults";
import { separator } from "./Separator.recipe";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "default" | "secondary" | "tertiary";

export type SeparatorProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  PropsOf<typeof separator> & {
    dataTheme?: string;
  };

/**
 * Generated, once the generator exists.
 *
 * `role` and `aria-orientation` are not here because they are plain HTML: a
 * caller may set either, and anything the recipe does not declare passes
 * straight to the element. The old component listed `role` in its
 * `splitProps` call only to re-emit it with a default.
 */
const Separator = defineComponent({
  recipe: separator,
  name: "Separator",
  defaults: defaults.Separator,
}) as (props: SeparatorProps) => JSX.Element;

export default Separator;
export { Separator };
