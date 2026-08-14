import "./Icon.css";
import type { Layout } from "../../lib/layouts";
import type { Flavor, UIBaseProps } from "../vocabulary";
import { icon } from "./Icon.recipe";

export type IconProps = UIBaseProps & {
  width?: number;
  height?: number;
  flavor?: Flavor;
  /** The icon set's own class, e.g. `icon-[mdi--cog]`. */
  name?: string;
};

/* -------------------------------------------------------------------------------------------------
 * Icon
 *
 * The name is a class rather than a child, because that is how the icon sets
 * this library ships work: the glyph arrives through CSS. It reaches the
 * element through the recipe rather than a `twMerge` here, so an icon composes
 * its classes the same way every other component does.
 *
 * Square by default at 24px. Both dimensions are still separate props, because
 * a few sets ship rectangular glyphs and forcing them square crops them.
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
    aria-hidden="true"
  />
);
