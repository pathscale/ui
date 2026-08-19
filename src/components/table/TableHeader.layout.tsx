import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableHeaderRecipe } from "./Table.recipe";

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
