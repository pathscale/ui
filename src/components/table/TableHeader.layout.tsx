import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableHeaderRecipe } from "./Table.recipe";

export type TableHeaderProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  UIBaseProps;

const TableHeader: Layout<typeof tableHeaderRecipe, TableHeaderProps> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <thead
      {...{ class: twMerge(CLASSES.header, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-header"
      {...rest}
    >
      {props.children}
    </thead>
  );
};

export default TableHeader;
