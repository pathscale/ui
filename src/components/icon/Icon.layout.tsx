import "./Icon.css";
import type { JSX } from "@solidjs/web";
import {Show} from "solid-js";
import type { Layout } from "../../lib/layouts";
import type { Flavor, UIBaseProps } from "../vocabulary";
import { icon } from "./Icon.recipe";
import { preloadClasses } from "./Icon.interactions";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type IconProps = UIBaseProps & {
  /**
   * The glyph, from either source.
   *
   * A **string** is a preload token, `lucide--copy` or the wrapped
   * `icon-[lucide--copy]`, resolved by the CSS the consuming application's
   * iconify build generates. A **element** is inline SVG the caller owns, which
   * is the escape hatch for brand marks, generated art, and anything an icon set
   * does not carry.
   *
   * The two cannot both apply, so they are one prop rather than two that can
   * disagree. Which one it is, is the type.
   */
  src?: string | JSX.Element;
  width?: number;
  height?: number;
  flavor?: Flavor;
};

/* -------------------------------------------------------------------------------------------------
 * Icon
 *
 * The library provides the box, the size and the colour; the application
 * provides the mark. Both sources inherit colour through `currentColor`, the
 * preload path because its generated rule masks with the glyph and paints
 * `background-color`, the inline path because an SVG authored for theming fills
 * with `currentColor` too. So `flavor` is one custom property and it works the
 * same either way.
 *
 * Square by default at 24px, with both dimensions still separate because some
 * sets ship rectangular glyphs and forcing them square crops them.
 * -----------------------------------------------------------------------------------------------*/
export const IconLayout: Layout<typeof icon, IconProps> = () => (
  <span
    {...slot.root}
    style={{
      width: `${local.width ?? 24}px`,
      height: `${local.height ?? 24}px`,
      ...(typeof local.style === "object" ? local.style : {}),
    }}
    data-flavor={local.flavor ?? "inherit"}
    data-source={typeof local.src === "string" ? "preload" : "svg"}
    aria-hidden="true"
  >
    <Show
      when={typeof local.src === "string"}
      fallback={<span {...slot.glyph}>{local.src}</span>}
    >
      <span {...slot.glyph} classList={{ [preloadClasses(local.src as string)]: true }} />
    </Show>
  </span>
);
