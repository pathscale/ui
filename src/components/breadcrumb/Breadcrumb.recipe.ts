import { recipe } from "../../lib/layouts";
// CSS class contract for Breadcrumb.
//
// Compound shape: this file exports a single CLASSES const whose top-level keys are the
// component parts (Root, Item). Each part follows the same per-component shape used by
// Button (`base`, optional `variant`/`size`/`flag`/`color` slots).
//
// `base` accepts a single string OR a readonly string[] when the part renders multiple
// classes unconditionally.

export const CLASSES = {
  Root: {
    base: "breadcrumb",
  },
  Item: {
    // breadcrumb__item is on the <li>; breadcrumb__link is on the <a>/<span> inside;
    // breadcrumb__separator is on the inner <span>, only rendered when isCurrent is false.
    // We list it here unconditionally because the safelist is a UNION of "could appear",
    // and over-including is safe (purges less aggressively) while under-including breaks UI.
    base: ["breadcrumb__item", "breadcrumb__link", "breadcrumb__separator"],
  },
} as const;
export const componentRecipe = recipe({
  component: "breadcrumb",
  slots: {
    breadcrumb: {},
    "breadcrumb-item": {},
    "breadcrumb-link": {},
    "breadcrumb-separator": {},
    root: {},
  },
});
