import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableBodyRecipe } from "./Table.recipe";

export type TableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  UIBaseProps;

const TableBody: Layout<typeof tableBodyRecipe, TableBodyProps> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <tbody
      {...{ class: twMerge(CLASSES.body, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-body"
      {...rest}
    >
      {local.children}
    </tbody>
  );
};

export default TableBody;
