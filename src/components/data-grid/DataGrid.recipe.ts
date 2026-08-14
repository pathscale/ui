import { recipe } from "../../lib/layouts";

export const CLASSES = {
  root: "data-grid",
  toolbar: "data-grid__toolbar",
  search: "data-grid__search",
  searchLabel: "data-grid__search-label",
  searchInput: "data-grid__search-input",
  headerCell: "data-grid__header-cell",
  headerButton: "data-grid__header-button",
  cell: "data-grid__cell",
  selectCell: "data-grid__select-cell",
  groupRow: "data-grid__group-row",
  empty: "data-grid__empty",
  pagination: "data-grid__pagination",
  pageStatus: "data-grid__page-status",
  borders: {
    none: "data-grid--borders-none",
    rows: "data-grid--borders-rows",
    cols: "data-grid--borders-cols",
    both: "data-grid--borders-both",
  },
  striping: {
    none: "data-grid--striping-none",
    rows: "data-grid--striping-rows",
    cols: "data-grid--striping-cols",
  },
  sticky: {
    none: "data-grid--sticky-none",
    header: "data-grid--sticky-header",
    columns: "data-grid--sticky-columns",
    both: "data-grid--sticky-both",
  },
  size: {
    xs: "data-grid--size-xs",
    sm: "data-grid--size-sm",
    md: "data-grid--size-md",
    lg: "data-grid--size-lg",
    xl: "data-grid--size-xl",
  },
  interactive: "data-grid--interactive",
} as const;

export const componentRecipe = recipe({
  component: "data-grid",
  slots: {
    root: {},
    "data-grid": {},
    "data-grid-toolbar": {},
    "data-grid-search": {},
    "data-grid-group-row": {},
    "data-grid-empty": {},
    "data-grid-pagination": {},
  },
});
