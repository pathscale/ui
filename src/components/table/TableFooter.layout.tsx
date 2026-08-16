import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableFooterRecipe } from "./Table.recipe";

export type TableFooterProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

const TableFooter: Layout<typeof tableFooterRecipe, TableFooterProps> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <div
      {...{ class: twMerge(CLASSES.footer, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-footer"
      {...rest}
    >
      {props.children}
    </div>
  );
};

export default TableFooter;
