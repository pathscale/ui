import type { JSX } from "solid-js";

export type SortDirection = "asc" | "desc" | null;

export interface SortingState {
  columnId: string | null;
  direction: SortDirection;
}

export interface StreamingColumnDef<T> {
  /** Unique identifier for the column (required for sorting) */
  id?: string;

  /** Header text or JSX element */
  header: JSX.Element | string;

  /** For simple field access */
  accessorKey?: keyof T & string;

  /** For computed access */
  accessorFn?: (row: T) => any;

  /** Custom cell renderer */
  cell?: (ctx: { row: { original: T } }) => JSX.Element;

  /** Custom sorting function */
  sortingFn?: (rowA: T, rowB: T) => number;

  /** Extra config (sorting, filters, etc.) */
  meta?: Record<string, any>;

  /** Enable column filter */
  enableColumnFilter?: boolean;

  /** Enable sorting for this column */
  enableSorting?: boolean;

  /** Custom filter function for this column */
  filterFn?: (row: T, filterValue: string) => boolean;
}

export interface StreamingConfig {
  /** Maximum buffer size (default: 1000) */
  maxBufferSize?: number;

  /** Append-only mode - don't remove stale rows (default: false) */
  appendMode?: boolean;
}

export interface PaginationConfig {
  /** Enable pagination (default: false) */
  enablePagination?: boolean;

  /** Number of rows per page (default: 10) */
  pageSize?: number;

  /** Initial page index (default: 0) */
  initialPage?: number;
}
