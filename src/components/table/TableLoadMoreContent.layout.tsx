import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableLoadMoreContentRecipe } from "./Table.recipe";

export type TableLoadMoreContentProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const TableLoadMoreContent: Layout<
  typeof tableLoadMoreContentRecipe,
  TableLoadMoreContentProps
> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <div
      {...{ class: twMerge(CLASSES.loadMoreContent, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-load-more-content"
      {...rest}
    >
      {local.children}
    </div>
  );
};

export default TableLoadMoreContent;
