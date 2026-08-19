import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableColumnResizerRecipe } from "./Table.recipe";

export type TableColumnResizerProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const TableColumnResizer: Layout<
  typeof tableColumnResizerRecipe,
  TableColumnResizerProps
> = () => {
  const rest = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "role",
    "aria-orientation",
  );

  return (
    <div
      role={props.role ?? "separator"}
      aria-orientation={local["aria-orientation"] ?? "vertical"}
      {...{ class: twMerge(CLASSES.columnResizer, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-column-resizer"
      {...rest}
    >
      {props.children}
    </div>
  );
};

export default TableColumnResizer;
