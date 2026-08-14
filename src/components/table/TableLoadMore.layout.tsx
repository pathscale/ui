import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableLoadMoreRecipe } from "./Table.recipe";

export type TableLoadMoreProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  UIBaseProps;

const TableLoadMore: Layout<
  typeof tableLoadMoreRecipe,
  TableLoadMoreProps
> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <tr
      {...{ class: twMerge(CLASSES.loadMore, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-load-more"
      {...rest}
    >
      {local.children}
    </tr>
  );
};

export default TableLoadMore;
