import { type Recipe, recipe } from "../../lib/layouts";
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
const recipeDefinition = {
  component: "table",
  slots: { root: {}, table: {} },
} as const;

export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
const tableScrollContainerRecipeDefinition = {
  component: "table-scroll-container",
  slots: { root: {}, "table-scroll-container": {} },
} as const;

export const tableScrollContainerRecipe: Recipe<typeof tableScrollContainerRecipeDefinition> =
  recipe(tableScrollContainerRecipeDefinition);
const tableContentRecipeDefinition = {
  component: "table-content",
  slots: { root: {}, "table-content": {} },
} as const;

export const tableContentRecipe: Recipe<typeof tableContentRecipeDefinition> =
  recipe(tableContentRecipeDefinition);
const tableHeaderRecipeDefinition = {
  component: "table-header",
  slots: { root: {}, "table-header": {} },
} as const;

export const tableHeaderRecipe: Recipe<typeof tableHeaderRecipeDefinition> =
  recipe(tableHeaderRecipeDefinition);
const tableColumnRecipeDefinition = {
  component: "table-column",
  slots: { root: {}, "table-column": {} },
} as const;

export const tableColumnRecipe: Recipe<typeof tableColumnRecipeDefinition> =
  recipe(tableColumnRecipeDefinition);
const tableBodyRecipeDefinition = {
  component: "table-body",
  slots: { root: {}, "table-body": {} },
} as const;

export const tableBodyRecipe: Recipe<typeof tableBodyRecipeDefinition> =
  recipe(tableBodyRecipeDefinition);
const tableRowRecipeDefinition = {
  component: "table-row",
  slots: { root: {}, "table-row": {} },
} as const;

export const tableRowRecipe: Recipe<typeof tableRowRecipeDefinition> =
  recipe(tableRowRecipeDefinition);
const tableCellRecipeDefinition = {
  component: "table-cell",
  slots: { root: {}, "table-cell": {} },
} as const;

export const tableCellRecipe: Recipe<typeof tableCellRecipeDefinition> =
  recipe(tableCellRecipeDefinition);
const tableExpandedRowRecipeDefinition = {
  component: "table-expanded-row",
  slots: { root: {}, "table-expanded-row": {} },
} as const;

export const tableExpandedRowRecipe: Recipe<typeof tableExpandedRowRecipeDefinition> =
  recipe(tableExpandedRowRecipeDefinition);
const tableFooterRecipeDefinition = {
  component: "table-footer",
  slots: { root: {}, "table-footer": {} },
} as const;

export const tableFooterRecipe: Recipe<typeof tableFooterRecipeDefinition> =
  recipe(tableFooterRecipeDefinition);
const tablePageSizeRecipeDefinition = {
  component: "table-page-size",
  slots: { root: {}, "table-page-size": {}, "table-page-size-label": {} },
} as const;

export const tablePageSizeRecipe: Recipe<typeof tablePageSizeRecipeDefinition> =
  recipe(tablePageSizeRecipeDefinition);
const tableResizableContainerRecipeDefinition = {
  component: "table-resizable-container",
  slots: { root: {}, "table-resizable-container": {} },
} as const;

export const tableResizableContainerRecipe: Recipe<typeof tableResizableContainerRecipeDefinition> =
  recipe(tableResizableContainerRecipeDefinition);
const tableColumnResizerRecipeDefinition = {
  component: "table-column-resizer",
  slots: { root: {}, "table-column-resizer": {} },
} as const;

export const tableColumnResizerRecipe: Recipe<typeof tableColumnResizerRecipeDefinition> =
  recipe(tableColumnResizerRecipeDefinition);
const tableLoadMoreRecipeDefinition = {
  component: "table-load-more",
  slots: { root: {}, "table-load-more": {} },
} as const;

export const tableLoadMoreRecipe: Recipe<typeof tableLoadMoreRecipeDefinition> =
  recipe(tableLoadMoreRecipeDefinition);
const tableLoadMoreContentRecipeDefinition = {
  component: "table-load-more-content",
  slots: { root: {}, "table-load-more-content": {} },
} as const;

export const tableLoadMoreContentRecipe: Recipe<typeof tableLoadMoreContentRecipeDefinition> =
  recipe(tableLoadMoreContentRecipeDefinition);
const tableSortIconRecipeDefinition = {
  component: "table-sort-icon",
  slots: { root: {}, "table-sort-icon": {} },
} as const;

export const tableSortIconRecipe: Recipe<typeof tableSortIconRecipeDefinition> =
  recipe(tableSortIconRecipeDefinition);
const tableExpandToggleRecipeDefinition = {
  component: "table-expand-toggle",
  slots: { root: {}, "table-expand-toggle": {} },
} as const;

export const tableExpandToggleRecipe: Recipe<typeof tableExpandToggleRecipeDefinition> =
  recipe(tableExpandToggleRecipeDefinition);
const tableVirtualSpacerRowRecipeDefinition = {
  component: "table-virtual-spacer-row",
  slots: { root: {}, "table-virtual-spacer-row": {} },
} as const;

export const tableVirtualSpacerRowRecipe: Recipe<typeof tableVirtualSpacerRowRecipeDefinition> =
  recipe(tableVirtualSpacerRowRecipeDefinition);
const tableMobileListViewRecipeDefinition = {
  component: "table-mobile-list-view",
  slots: {
    root: {},
    "table-mobile-list-view": {},
    "table-mobile-list-view-list": {},
    "table-mobile-list-view-item": {},
    "table-mobile-list-view-empty": {},
  },
} as const;

export const tableMobileListViewRecipe: Recipe<typeof tableMobileListViewRecipeDefinition> =
  recipe(tableMobileListViewRecipeDefinition);
const tableInlineConfirmRecipeDefinition = {
  component: "table-inline-confirm",
  slots: {
    root: {},
    "table-inline-confirm": {},
    "table-inline-confirm-prompt": {},
    "table-inline-confirm-actions": {},
  },
} as const;

export const tableInlineConfirmRecipe: Recipe<typeof tableInlineConfirmRecipeDefinition> =
  recipe(tableInlineConfirmRecipeDefinition);
