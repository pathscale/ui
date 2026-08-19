import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableRowRecipe } from "./Table.recipe";

export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  UIBaseProps;

const TableRow: Layout<typeof tableRowRecipe, TableRowProps> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <tr
      {...{ class: twMerge(CLASSES.row, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-row"
      {...rest}
    >
      {props.children}
    </tr>
  );
};

export default TableRow;
