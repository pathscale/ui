import TableBody from "./TableBody.generated";
import TableCell from "./TableCell.generated";
import TableColumn from "./TableColumn.generated";
import TableColumnResizer from "./TableColumnResizer.generated";
import TableContent from "./TableContent.generated";
import TableExpandedRow from "./TableExpandedRow.generated";
import TableFooter from "./TableFooter.generated";
import TableHeader from "./TableHeader.generated";
import TableLoadMore from "./TableLoadMore.generated";
import TableLoadMoreContent from "./TableLoadMoreContent.generated";
import TablePageSize from "./TablePageSize.generated";
import TableResizableContainer from "./TableResizableContainer.generated";
import TableRoot from "./TableRoot.generated";
import TableRow from "./TableRow.generated";
import TableScrollContainer from "./TableScrollContainer.generated";

/* The compound lives here rather than in a `.layout.tsx` because it is not a
   Layout: it declares no recipe and renders nothing. Keeping it out of the
   compiler's way is what lets each part own its own file. */
const TableRootCompound: typeof TableRoot & {
  Root: typeof TableRoot;
  ScrollContainer: typeof TableScrollContainer;
  Content: typeof TableContent;
  Header: typeof TableHeader;
  Column: typeof TableColumn;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Cell: typeof TableCell;
  ExpandedRow: typeof TableExpandedRow;
  Footer: typeof TableFooter;
  PageSize: typeof TablePageSize;
  ResizableContainer: typeof TableResizableContainer;
  ColumnResizer: typeof TableColumnResizer;
  LoadMore: typeof TableLoadMore;
  LoadMoreContent: typeof TableLoadMoreContent;
} = Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollContainer: TableScrollContainer,
  Content: TableContent,
  Header: TableHeader,
  Column: TableColumn,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  ExpandedRow: TableExpandedRow,
  Footer: TableFooter,
  PageSize: TablePageSize,
  ResizableContainer: TableResizableContainer,
  ColumnResizer: TableColumnResizer,
  LoadMore: TableLoadMore,
  LoadMoreContent: TableLoadMoreContent,
});

export default TableRootCompound;
