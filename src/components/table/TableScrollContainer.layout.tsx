import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableScrollContainerRecipe } from "./Table.recipe";

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
