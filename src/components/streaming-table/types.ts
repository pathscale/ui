import type { JSX } from "solid-js";

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
}
