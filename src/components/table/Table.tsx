import { splitProps, createMemo, createSignal, type JSX, Index } from "solid-js";
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
  className: string;
  /** Unique key-per-row extractor (e.g. row => row.id) */
  rowKey: (row: Row) => string | number;
  /** Called when selection changes */
  onSelectionChange?: (selectedKeys: Array<string | number>) => void;
  /** Render “expanded” content for a given row */
  renderDetail?: (row: Row) => JSX.Element;
  onSort?: (key: keyof Row, direction: "asc" | "desc") => void;
} & VariantProps<typeof tableVariants> &
  ComponentProps<"table">;

const Table = <Row extends Record<string, any>>(props: TableProps<Row>) => {

  const [localProps, variantProps, otherProps] = splitProps(
    props,
    ["columns", "rows", "onSort", "className", "rowKey"] as const,
    Object.keys(tableVariants.variantKeys ?? {}) as any,
  );

  const [sortKey, setSortKey] = createSignal<keyof Row | null>(null);
  const [sortDir, setSortDir] = createSignal<"asc" | "desc">("asc");

  const data = createMemo(() => {
    const key = sortKey();
    const dir = sortDir();
    // if no sort key, return the original rows array (identity stable)
    if (!key) return localProps.rows;

    // otherwise return a new, sorted copy
    return [...localProps.rows].sort((a, b) => {
      if (a[key] === b[key]) return 0;
      const res = a[key]! > b[key]! ? 1 : -1;
      return dir === "asc" ? res : -res;
    });
  });
  const baseVars = () => variantProps as VariantProps<typeof tableVariants>;

  const wrapperClass = classes(
    tableWrapper(),
    localProps.className
  );

  const tableClass = classes(
    tableVariants(baseVars()),
    localProps.className
  );
  // click handler
  const handleHeaderClick = (colKey: keyof Row, isSortable?: boolean) => {
    if (!isSortable) return;
    // toggle direction if same column
    if (sortKey() === colKey) {
      setSortDir(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(() => colKey);
      setSortDir("asc");
    }
    // notify parent if provided
    props.onSort?.(colKey, sortDir());
  };

  return (
    <div class={wrapperClass}>
      <table {...otherProps} class={tableClass}>
        <thead>
          <tr>
            {localProps.columns.map((col) => (
              <th
                key={String(col.key)}                                           // ← key
                class={tableVariants({ ...baseVars(), cell: variantProps.cell, divider: "on" })}
                onClick={() => handleHeaderClick(col.key, col.sortable)}
                style={col.sortable ? { cursor: "pointer" } : {}}
                role="columnheader"
                aria-sort={sortKey() === col.key ? sortDir() : undefined}
              >
                {col.header}
                {/* show arrow if sorted */}
                {sortKey() === col.key && (sortDir() === "asc" ? " ↑" : " ↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Index each={data()}>
            {(rowAccessor) => {
              const row = rowAccessor();
              return (
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
              );
            }}
          </Index>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
