import { type JSX, splitProps } from "solid-js";
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
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <div
      {...{ class: twMerge(CLASSES.resizableContainer, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-resizable-container"
      {...rest}
    >
      {local.children}
    </div>
  );
};

export default TableResizableContainer;
