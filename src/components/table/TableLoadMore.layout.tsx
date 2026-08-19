import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableLoadMoreRecipe } from "./Table.recipe";

export type TableLoadMoreProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  UIBaseProps;

const TableLoadMore: Layout<
  typeof tableLoadMoreRecipe,
  TableLoadMoreProps
> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <tr
      {...{ class: twMerge(CLASSES.loadMore, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-load-more"
      {...rest}
    >
      {props.children}
    </tr>
  );
};

export default TableLoadMore;
