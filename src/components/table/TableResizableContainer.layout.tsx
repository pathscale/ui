import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableResizableContainerRecipe } from "./Table.recipe";

export type TableResizableContainerProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const TableResizableContainer: Layout<
  typeof tableResizableContainerRecipe,
  TableResizableContainerProps
> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <div
      {...{ class: twMerge(CLASSES.resizableContainer, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-resizable-container"
      {...rest}
    >
      {props.children}
    </div>
  );
};

export default TableResizableContainer;
