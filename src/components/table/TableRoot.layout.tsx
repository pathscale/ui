import "./Table.css";
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { TableContext, type TableVariant } from "./Table.context";
import { CLASSES, componentRecipe } from "./Table.recipe";

export type TableRootProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps & {
    variant?: TableVariant;
  };

const TableRoot: Layout<typeof componentRecipe, TableRootProps> = () => {
  const [local, rest] = splitProps(props, [
    "children",
    "variant",
    "class",
    "dataTheme",
  ]);

  const variant = () => local.variant ?? "primary";

  return (
    <TableContext.Provider value={{ variant }}>
      <div
        {...{
          class: twMerge(
            CLASSES.root.base,
            CLASSES.root.variant[variant()],
            local.class,
          ),
        }}
        data-theme={local.dataTheme}
        data-slot="table"
        data-variant={variant()}
        {...rest}
      >
        {local.children}
      </div>
    </TableContext.Provider>
  );
};

export default TableRoot;
