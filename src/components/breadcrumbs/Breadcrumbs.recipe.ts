import { recipe } from "solid-layouts";

/**
 * The old `Item.base` was a three-element array, and its comment explains
 * why: `breadcrumbs__item` sits on the `<li>`, `breadcrumbs__link` on the
 * anchor inside it, and `breadcrumbs__separator` on a span rendered only when
 * the item is not current. All three were listed together because the purge
 * safelist needed the union, and a map of one name per part had nowhere else
 * to put them.
 *
 * As slots they are three elements, which is what they always were.
 */
export const breadcrumbs = recipe({
  component: "breadcrumbs",
  element: "nav",
  slots: {
    root: { base: "breadcrumbs" },
    item: { base: "breadcrumbs__item" },
    link: { base: "breadcrumbs__link" },
    separator: { base: "breadcrumbs__separator" },
  },
  state: {
    current: { true: { link: "breadcrumbs__link--current" } },
  },
});
