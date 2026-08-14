import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableColumnResizerRecipe } from "./Table.recipe";

export type TableColumnResizerProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const TableColumnResizer: Layout<
  typeof tableColumnResizerRecipe,
  TableColumnResizerProps
> = () => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "role",
    "aria-orientation",
  ]);

  return (
    <div
      role={local.role ?? "separator"}
      aria-orientation={local["aria-orientation"] ?? "vertical"}
      {...{ class: twMerge(CLASSES.columnResizer, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-column-resizer"
      {...rest}
    >
      {local.children}
    </div>
  );
};

export default TableColumnResizer;
