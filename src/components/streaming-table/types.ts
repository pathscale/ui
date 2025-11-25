import type { JSX } from "solid-js";
import type { EnhancedTableProps } from "../table/EnhancedTable";

export interface StreamingColumnDef<T> {
  /** Header text or JSX element */
  header: JSX.Element | string;

  /** For simple field access */
  accessorKey?: keyof T & string;

  /** For computed access */
  accessorFn?: (row: T) => any;

  /** Custom cell renderer */
  cell?: (ctx: { row: { original: T } }) => JSX.Element;

  /** Extra config (sorting, filters, etc.) */
  meta?: Record<string, any>;

  /** Enable column filter */
  enableColumnFilter?: boolean;

  /** Enable sorting for this column */
  enableSorting?: boolean;
}

export interface StreamingConfig {
  /** Maximum buffer size (default: 1000) */
  maxBufferSize?: number;

  /** Append-only mode - don't remove stale rows (default: false) */
  appendMode?: boolean;
}
