import { splitProps, createMemo } from "solid-js";
import type { ComponentProps } from "solid-js";
import type { VariantProps, ClassProps } from "@src/lib/style";
import { classes } from "@src/lib/style";
import { tableWrapper, tableVariants } from "./Table.styles";

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

  const [localProps, variantProps, otherProps] = splitProps(
    props,
    ["columns", "rows", "class", "className"] as const,
    Object.keys(tableVariants.variantKeys ?? {}) as any,
  );

  const data = createMemo(() => localProps.rows);
  const cols = createMemo(() => localProps.columns);
  const baseVars = () => variantProps as VariantProps<typeof tableVariants>;

  const wrapperClass = classes(
    tableWrapper(),
    localProps.class,
    localProps.className
  );

  const tableClass = classes(
    tableVariants(baseVars()),
    otherProps.class,
    otherProps.className
  );

  return (
    <div class={wrapperClass}>
      <table {...otherProps} class={tableClass}>
        <thead>
          <tr>
            {cols().map(col => (
              <th class={tableVariants({ ...baseVars(), cell: variantProps.cell, divider: "on" })}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data().map(row => (
            <tr class={tableVariants({ ...baseVars(), row: variantProps.row })}>
              {cols().map((col, i) => (
                <td
                  class={tableVariants({
                    ...baseVars(),
                    cell: variantProps.cell,
                    divider: i === cols().length - 1 ? "off" : "on",
                  })}
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
