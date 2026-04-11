// CSS class contract for Breadcrumbs.
//
// Compound shape: this file exports a single CLASSES const whose top-level keys are the
// component parts (Root, Item). Each part follows the same per-component shape used by
// Button (`base`, optional `variant`/`size`/`flag`/`color` slots).
//
// `base` accepts a single string OR a readonly string[] when the part renders multiple
// classes unconditionally.

export const CLASSES = {
  Root: {
    base: "breadcrumbs",
  },
  Item: {
    // breadcrumbs__item is on the <li>; breadcrumbs__link is on the <a>/<span> inside;
    // breadcrumbs__separator is on the inner <span>, only rendered when isCurrent is false.
    // We list it here unconditionally because the safelist is a UNION of "could appear",
    // and over-including is safe (purges less aggressively) while under-including breaks UI.
    base: ["breadcrumbs__item", "breadcrumbs__link", "breadcrumbs__separator"],
  },
} as const;
