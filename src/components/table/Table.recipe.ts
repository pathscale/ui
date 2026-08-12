import { recipe } from "solid-layouts";

export const table = recipe({
  component: "table",
  element: "div",
  slots: {
    root: { base: "table-root" },
    scroll: { base: "table__scroll-container" },
    content: { base: "table__content" },
    header: { base: "table__header" },
    column: { base: "table__column" },
    body: { base: "table__body" },
    row: { base: "table__row" },
    cell: { base: "table__cell" },
    expandedRow: { base: "table__expanded-row" },
    expandedCell: { base: "table__expanded-cell" },
    footer: { base: "table__footer" },
  },
  props: {
    variant: {
      primary: "table-root--primary",
      secondary: "table-root--secondary",
    },
  },
});
