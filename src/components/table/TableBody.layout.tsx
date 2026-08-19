import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableBodyRecipe } from "./Table.recipe";

export type TableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  UIBaseProps;

const TableBody: Layout<typeof tableBodyRecipe, TableBodyProps> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <tbody
      {...{ class: twMerge(CLASSES.body, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-body"
      {...rest}
    >
      {props.children}
    </tbody>
  );
};

export default TableBody;
