import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import "./GlowCard.css";
import { GlowCardLayout } from "./GlowCard.layout";
import { createGlowCard } from "./GlowCard.logic";
import { glowCard } from "./GlowCard.recipe";

export type GlowCardProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    /**
     * Was always applied unconditionally; it is a presentation axis now, and
     * still defaults on, so existing callers see no change.
     */
    isolate?: boolean;
  };

const GlowCard = defineComponent({
  recipe: glowCard,
  name: "GlowCard",
  defaults: { isolate: true },
  // Declared so the component's own handlers can compose with the caller's
  // rather than being overwritten by the plain-HTML bucket.
  behaviour: ["onMouseMove", "onMouseLeave"],
  setup: createGlowCard,
  layout: GlowCardLayout,
}) as unknown as (props: GlowCardProps) => JSX.Element;

export default GlowCard;
export { GlowCard };
