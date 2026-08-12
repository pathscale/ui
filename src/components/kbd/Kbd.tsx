import "./Kbd.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import type { KbdKey } from "./Kbd.keys";
import { KbdAbbrLayout, KbdContentLayout, KbdRootLayout } from "./Kbd.layout";
import { kbd } from "./Kbd.recipe";

export type KbdVariant = "default" | "light";

export type KbdRootProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    variant?: KbdVariant;
  };

export type KbdAbbrProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  IComponentBaseProps & {
    keyValue: KbdKey;
  };

export type KbdContentProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const KbdRoot = defineComponent({
  recipe: kbd,
  name: "Kbd",
  defaults: { variant: "default" },
  layout: KbdRootLayout,
}) as unknown as (props: KbdRootProps) => JSX.Element;

/**
 * `keyValue` and `title` are behaviour: the abbreviation picks its glyph from
 * one and defaults the other from it. Left as plain HTML, `title` would reach
 * the element first and the default would overwrite the caller's.
 */
const KbdAbbr = defineComponent({
  recipe: kbd,
  name: "KbdAbbr",
  slot: "abbr",
  behaviour: ["keyValue", "title"],
  setup: (behaviour) => ({
    keyValue: behaviour.keyValue,
    title: behaviour.title,
  }),
  layout: KbdAbbrLayout,
}) as unknown as (props: KbdAbbrProps) => JSX.Element;

const KbdContent = defineComponent({
  recipe: kbd,
  name: "KbdContent",
  slot: "content",
  layout: KbdContentLayout,
}) as unknown as (props: KbdContentProps) => JSX.Element;

const Kbd = Object.assign(KbdRoot, {
  Root: KbdRoot,
  Abbr: KbdAbbr,
  Content: KbdContent,
});

export type KbdProps = KbdRootProps;
export { kbdKeysLabelMap, kbdKeysMap } from "./Kbd.keys";
export type { KbdKey };
export { KbdAbbr, KbdContent, KbdRoot };
export default Kbd;
