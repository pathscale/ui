import { recipe } from "../../lib/layouts";
export const CLASSES = {
  root: {
    base: "table-root",
    variant: {
      primary: "table-root--primary",
      secondary: "table-root--secondary",
    },
  },
  scroll: "table__scroll-container",
  content: "table__content",
  header: "table__header",
  column: "table__column",
  body: "table__body",
  row: "table__row",
  cell: "table__cell",
  expandedRow: "table__expanded-row",
  expandedCell: "table__expanded-cell",
  footer: "table__footer",
  pageSize: "table__page-size",
  pageSizeLabel: "table__page-size-label",
  pageSizeSelect: "table__page-size-select",
  resizableContainer: "table__resizable-container",
  columnResizer: "table__column-resizer",
  loadMore: "table__load-more",
  loadMoreContent: "table__load-more-content",
} as const;

/* One recipe per part, not one shared recipe for the whole compound.
   The slot checker compares a recipe's declared slots against the `data-slot`
   values in the file that names it, so a 27-slot recipe shared by 20 files
   reports 26 unrendered slots in each of them. Declaring only what a part
   renders is what makes those diagnostics mean something. */
export const componentRecipe = recipe({
  component: "table",
  slots: { root: {}, table: {} },
});
export const tableScrollContainerRecipe = recipe({
  component: "table-scroll-container",
  slots: { root: {}, "table-scroll-container": {} },
});
export const tableContentRecipe = recipe({
  component: "table-content",
  slots: { root: {}, "table-content": {} },
});
export const tableHeaderRecipe = recipe({
  component: "table-header",
  slots: { root: {}, "table-header": {} },
});
export const tableColumnRecipe = recipe({
  component: "table-column",
  slots: { root: {}, "table-column": {} },
});
export const tableBodyRecipe = recipe({
  component: "table-body",
  slots: { root: {}, "table-body": {} },
});
export const tableRowRecipe = recipe({
  component: "table-row",
  slots: { root: {}, "table-row": {} },
});
export const tableCellRecipe = recipe({
  component: "table-cell",
  slots: { root: {}, "table-cell": {} },
});
export const tableExpandedRowRecipe = recipe({
  component: "table-expanded-row",
  slots: { root: {}, "table-expanded-row": {} },
});
export const tableFooterRecipe = recipe({
  component: "table-footer",
  slots: { root: {}, "table-footer": {} },
});
export const tablePageSizeRecipe = recipe({
  component: "table-page-size",
  slots: { root: {}, "table-page-size": {}, "table-page-size-label": {} },
});
export const tableResizableContainerRecipe = recipe({
  component: "table-resizable-container",
  slots: { root: {}, "table-resizable-container": {} },
});
export const tableColumnResizerRecipe = recipe({
  component: "table-column-resizer",
  slots: { root: {}, "table-column-resizer": {} },
});
export const tableLoadMoreRecipe = recipe({
  component: "table-load-more",
  slots: { root: {}, "table-load-more": {} },
});
export const tableLoadMoreContentRecipe = recipe({
  component: "table-load-more-content",
  slots: { root: {}, "table-load-more-content": {} },
});
export const tableSortIconRecipe = recipe({
  component: "table-sort-icon",
  slots: { root: {}, "table-sort-icon": {} },
});
export const tableExpandToggleRecipe = recipe({
  component: "table-expand-toggle",
  slots: { root: {}, "table-expand-toggle": {} },
});
export const tableVirtualSpacerRowRecipe = recipe({
  component: "table-virtual-spacer-row",
  slots: { root: {}, "table-virtual-spacer-row": {} },
});
export const tableMobileListViewRecipe = recipe({
  component: "table-mobile-list-view",
  slots: {
    root: {},
    "table-mobile-list-view": {},
    "table-mobile-list-view-list": {},
    "table-mobile-list-view-item": {},
    "table-mobile-list-view-empty": {},
  },
});
export const tableInlineConfirmRecipe = recipe({
  component: "table-inline-confirm",
  slots: {
    root: {},
    "table-inline-confirm": {},
    "table-inline-confirm-prompt": {},
    "table-inline-confirm-actions": {},
  },
});
