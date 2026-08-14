import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableFooterRecipe } from "./Table.recipe";

export type TableFooterProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

const TableFooter: Layout<typeof tableFooterRecipe, TableFooterProps> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <div
      {...{ class: twMerge(CLASSES.footer, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-footer"
      {...rest}
    >
      {local.children}
    </div>
  );
};

export default TableFooter;
