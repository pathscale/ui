import "./Table.css";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { TableContext, type TableVariant } from "./Table.context";
import { CLASSES, type componentRecipe } from "./Table.recipe";

export type TableRootProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps & {
    variant?: TableVariant;
  };

const TableRoot: Layout<typeof componentRecipe, TableRootProps> = () => {
  const rest = omit(props, "children", "variant", "class", "dataTheme");

  const variant = () => props.variant ?? "primary";

  return (
    <TableContext value={{ variant }}>
      <div
        {...{
          class: twMerge(
            CLASSES.root.base,
            CLASSES.root.variant[variant()],
            props.class,
          ),
        }}
        data-theme={props.dataTheme}
        data-slot="table"
        data-variant={variant()}
        {...rest}
      >
        {props.children}
      </div>
    </TableContext>
  );
};

export default TableRoot;
