import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableResizableContainerRecipe } from "./Table.recipe";

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
