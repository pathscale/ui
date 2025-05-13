// components/Table.tsx
import {
  type Component,
  createMemo,
  splitProps,
  type ComponentProps,
} from "solid-js";
import { tableWrapper, tableVariants, columnDividerClass } from "./Table.styles";
import type { VariantProps, ClassProps } from "@src/lib/style";
import { classes } from "@src/lib/style";

export type Column<Row> = {
  key: keyof Row;
  header: string;
};

export type TableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
} & VariantProps<typeof tableVariants> &
  ClassProps &
  ComponentProps<"table">;

const Table = <Row extends Record<string, any>>(props: TableProps<Row>) => {
  const [local, rest] = splitProps(
    props,
    [
      "columns",
      "rows",
      "class",
      "className",
      // variant props
      "header",
      "row",
      "cell",
    ] as const
  );

  const data = createMemo(() => local.rows);
  const cols = createMemo(() => local.columns);

  const tableClass = classes(
    tableVariants({ header: local.header, row: local.row, cell: local.cell }),
    rest.class,
    rest.className
  );

  return (
    <div class={classes(tableWrapper(), local.class, local.className)}>
      <table {...rest} class={tableClass}>
        <thead>
          <tr>
            {cols().map((col) => (
              <th>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data().map((row) => (
            <tr>
              {cols().map((col, colIndex) => (
                <td
                  class={classes(
                    columnDividerClass && colIndex !== cols().length - 1 && columnDividerClass,
                    tableVariants({ cell: local.cell }) // include base cell styling
                  )}
                >
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
