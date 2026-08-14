import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableHeaderRecipe } from "./Table.recipe";

export type TableHeaderProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  UIBaseProps;

const TableHeader: Layout<typeof tableHeaderRecipe, TableHeaderProps> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <thead
      {...{ class: twMerge(CLASSES.header, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-header"
      {...rest}
    >
      {local.children}
    </thead>
  );
};

export default TableHeader;
