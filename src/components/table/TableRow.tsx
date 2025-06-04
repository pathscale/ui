import {
  type Component,
  splitProps,
  children as resolveChildren,
  JSX,
  For,
  Show,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { type IComponentBaseProps } from "../types";

export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  IComponentBaseProps & {
    active?: boolean;
    noCell?: boolean;
    isHeader?: boolean;
    firstCellHeader?: boolean;
  };

const TableRow: Component<TableRowProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "active",
    "noCell",
    "isHeader",
    "firstCellHeader",
  ]);
  const classAttr = () =>
    twMerge(
      clsx(local.class, {
        active: local.active,
      })
    );

  const resolved = resolveChildren(() => local.children);

  return (
    <tr {...rest} class={classAttr()}>
      <Show
        when={local.noCell}
        fallback={
          <For each={resolved.toArray()}>
            {(child, i) => {
              // If it's a header row, use th for all cells
              if (local.isHeader) {
                return <th>{child}</th>;
              }
              // If firstCellHeader is true, use th for the first cell only
              if (local.firstCellHeader && i() === 0) {
                return <th>{child}</th>;
              }
              // Default case: use td for data cells
              return <td>{child}</td>;
            }}
          </For>
        }
      >
        {resolved()}
      </Show>
    </tr>
  );
};

export default TableRow;
