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
  /**
   * What this icon means, for an icon that carries meaning on its own.
   *
   * Most icons sit beside a label that already says it, and repeating it makes
   * a reader hear the same thing twice; those stay hidden, which is the
   * default and stays the default. The ones that need this are the icons that
   * *are* the label: a status glyph in a table cell, a lone mark in a square
   * button, a trend arrow next to a bare number.
   *
   * Setting it swaps `aria-hidden="true"` for `role="img"` and this name. The
   * default was right and there was simply no way off it: `aria-hidden` was
   * written straight into the markup, so it survived any `aria-label` a call
   * site passed through and the icon stayed out of the tree regardless.
   */
  label?: string;
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
 *
 * Hidden from the accessibility tree unless `label` says otherwise. The default
 * is right for nearly every icon in the fleet -- decoration beside text that
 * already says it -- and it was also the only behaviour there was: `aria-hidden`
 * was written into the markup, so a call site that passed `aria-label` got an
 * element that carried both and stayed out of the tree anyway. `label` is the
 * way off it, and it is one prop rather than an escape hatch per attribute
 * because an icon that is announced needs a role and a name together or neither.
 * -----------------------------------------------------------------------------------------------*/
export const IconLayout: Layout<typeof icon, IconProps> = () => (
  // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role and name are decided by one prop, so both are present or neither is; the rule reads a static role only.
  <span
    {...slot.root}
    style={{
      width: `${local.width ?? 24}px`,
      height: `${local.height ?? 24}px`,
      ...(typeof local.style === "object" ? local.style : {}),
    }}
    data-flavor={local.flavor ?? "inherit"}
    data-source={typeof local.src === "string" ? "preload" : "svg"}
    role={local.label ? "img" : undefined}
    aria-label={local.label}
    aria-hidden={local.label ? undefined : "true"}
  >
    <Show
      when={typeof local.src === "string"}
      fallback={<span {...slot.glyph}>{local.src}</span>}
    >
      {/*
        `classList` is gone in 2.0: `class` takes the same record and applies
        the truthy keys, which is what this was always doing with one of them.
      */}
      <span {...slot.glyph} class={preloadClasses(local.src as string)} />
    </Show>
  </span>
);
