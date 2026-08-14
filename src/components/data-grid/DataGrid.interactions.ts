import type { DataGridColumn, DataGridRow } from "./createDataGrid";

/* Everything here could sit in the Layout and must not. A free identifier in a
   `.layout.tsx` binds to props, so a bare `String(value)` compiles to
   `props.String(value)` and is undefined at runtime. Anything reaching for a
   global belongs on this side of the line. */

export const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
};

export const columnSpan = (visible: number, hasSelection: boolean): number =>
  visible + (hasSelection ? 1 : 0);

/** 1-based, for display. The model counts pages from zero. */
export const pageLabel = (page: number, pageCount: number): string =>
  `${page + 1} / ${pageCount}`;

export const rangeLabel = (
  page: number,
  pageSize: number,
  total: number,
): string => {
  if (total === 0) return "0";
  const first = page * pageSize + 1;
  const last = Math.min(total, (page + 1) * pageSize);
  return `${first}–${last} of ${total}`;
};

export const searchPlaceholder = (label: string): string => `Search ${label}`;

export const cellContent = <Row extends DataGridRow>(
  column: DataGridColumn<Row>,
  row: Row,
  index: number,
) => {
  if (column.render) {
    return column.render({ value: row[column.name], row, column, index });
  }
  return formatCell(row[column.name]);
};

export const readInputValue = (event: {
  currentTarget: HTMLInputElement;
}): string => event.currentTarget.value;
