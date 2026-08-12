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
export const componentRecipe = recipe({component:"table",slots:{"root":{},"table":{},"table-body":{},"table-cell":{},"table-column":{},"table-column-resizer":{},"table-content":{},"table-expand-toggle":{},"table-expanded-row":{},"table-footer":{},"table-header":{},"table-inline-confirm":{},"table-inline-confirm-actions":{},"table-inline-confirm-prompt":{},"table-load-more":{},"table-load-more-content":{},"table-mobile-list-view":{},"table-mobile-list-view-empty":{},"table-mobile-list-view-item":{},"table-mobile-list-view-list":{},"table-page-size":{},"table-page-size-label":{},"table-resizable-container":{},"table-row":{},"table-scroll-container":{},"table-sort-icon":{},"table-virtual-spacer-row":{},},});
