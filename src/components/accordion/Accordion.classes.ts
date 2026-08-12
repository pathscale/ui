import { recipe } from "../../lib/style";

/**
 * Accordion's design API.
 *
 * Each export is one part of the component, and its variant axes are the props
 * that part exposes. Reading this file tells you everything that can vary about
 * an accordion without opening the markup, which is the property the `.vue`
 * single-file components had and the old nested `CLASSES` object did not: there
 * the defaults lived in the `.tsx` as `?? "default"` accessors, and the flags
 * were `&&` chains at the point of use.
 *
 * No Tailwind here, so none of these declare `tailwind: true` and none of them
 * pay for `twMerge`.
 */

export const accordionRoot = recipe({
  base: "accordion",
  variants: {
    variant: {
      default: "accordion--default",
      surface: "accordion--surface",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const accordionItem = recipe({
  base: "accordion__item",
  variants: {
    expanded: { true: "accordion__item--expanded" },
    disabled: { true: "accordion__item--disabled" },
    hideSeparator: { true: "accordion__item--hide-separator" },
  },
});

export const accordionTrigger = recipe({
  base: "accordion__trigger",
});

export const accordionIndicator = recipe({
  base: "accordion__indicator",
  variants: {
    expanded: { true: "accordion__indicator--expanded" },
  },
});

export const accordionContent = recipe({
  base: "accordion__content",
  variants: {
    expanded: { true: "accordion__content--expanded" },
  },
});

export const accordionBody = recipe({ base: "accordion__body" });

export const accordionBodyInner = recipe({ base: "accordion__body-inner" });
