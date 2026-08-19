import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableScrollContainerRecipe } from "./Table.recipe";

export type TableScrollContainerProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const TableScrollContainer: Layout<
  typeof tableScrollContainerRecipe,
  TableScrollContainerProps
> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <div
      {...{ class: twMerge(CLASSES.scroll, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-scroll-container"
      {...rest}
    >
      {props.children}
    </div>
  );
};

export default TableScrollContainer;
