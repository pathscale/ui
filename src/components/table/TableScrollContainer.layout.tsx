import { type JSX, splitProps } from "solid-js";
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
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <div
      {...{ class: twMerge(CLASSES.scroll, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-scroll-container"
      {...rest}
    >
      {local.children}
    </div>
  );
};

export default TableScrollContainer;
