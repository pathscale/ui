import { recipe } from "solid-layouts";

export const pagination = recipe({
  component: "pagination",
  element: "nav",
  slots: {
    root: { base: "pagination" },
    summary: { base: "pagination__summary" },
    content: { base: "pagination__content" },
    item: { base: "pagination__item" },
    link: { base: "pagination__link" },
    linkNav: { base: "pagination__link--nav" },
    ellipsis: { base: "pagination__ellipsis" },
  },
});
