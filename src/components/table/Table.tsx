import {
  splitProps,
  createMemo,
  createSignal,
  type JSX,
  For,
} from "solid-js";
import type { ComponentProps } from "solid-js";
import type { VariantProps } from "@src/lib/style";
import { classes } from "@src/lib/style";
import { tableWrapper, tableVariants } from "./Table.styles";

export type Column<Row> = {
  key: keyof Row;
  header: string;
  sortable?: boolean;
};

export type TableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  className?: string;
  rowKey: (row: Row) => string | number;
  onSelectionChange?: (selectedKeys: Array<string | number>) => void;
  renderDetail?: (row: Row) => JSX.Element;
  onSort?: (key: keyof Row, direction: "asc" | "desc") => void;
} & VariantProps<typeof tableVariants> &
  ComponentProps<"table">;

const Table = <Row extends Record<string, any>>(props: TableProps<Row>) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    ["columns", "rows", "onSort", "className", "rowKey"] as const,
    Object.keys(tableVariants.variantKeys ?? {}) as any
  );

  const [sortKey, setSortKey] = createSignal<keyof Row | null>(null);
  const [sortDir, setSortDir] = createSignal<"asc" | "desc">("asc");

  const data = createMemo(() => localProps.rows);

  const baseVars = () => variantProps as VariantProps<typeof tableVariants>;

  const wrapperClass = classes(
    tableWrapper(),
    localProps.className
  );
  const tableClass = classes(
    tableVariants(baseVars()),
    localProps.className
  );

  const handleHeaderClick = (colKey: any, isSortable: any) => {
    if (!isSortable) return;
    const newDir =
      sortKey() === colKey && sortDir() === "asc" ? "desc" : "asc";

    setSortKey(() => colKey);
    setSortDir(newDir);

    props.onSort?.(colKey, newDir);
  };

  return (
    <div class={wrapperClass}>
      <table {...otherProps} class={tableClass}>
        <thead>
          <tr>
            {localProps.columns.map((col) => (
              <th
                class={tableVariants({ ...baseVars(), cell: variantProps.cell, divider: "on" })}
                onClick={() => handleHeaderClick(col.key, col.sortable)}
                style={col.sortable ? { cursor: "pointer" } : undefined}
                role="columnheader"
                aria-sort={
                  sortKey() === col.key
                    ? sortDir() === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.header}
                {sortKey() === col.key && (sortDir() === "asc" ? " ↑" : " ↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <For each={data()}>
            {(row:any) => (
              <tr
                class={tableVariants({ ...baseVars(), row: variantProps.row })}
              >
                {localProps.columns.map((col, ci) => (
                  <td
                    class={tableVariants({
                      ...baseVars(),
                      cell: variantProps.cell,
                      divider:
                        ci === localProps.columns.length - 1 ? "off" : "on",
                    })}
                  >
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
