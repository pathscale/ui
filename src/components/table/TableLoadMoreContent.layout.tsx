import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableLoadMoreContentRecipe } from "./Table.recipe";

export type TableLoadMoreContentProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const TableLoadMoreContent: Layout<
  typeof tableLoadMoreContentRecipe,
  TableLoadMoreContentProps
> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <div
      {...{ class: twMerge(CLASSES.loadMoreContent, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-load-more-content"
      {...rest}
    >
      {props.children}
    </div>
  );
};

export default TableLoadMoreContent;
