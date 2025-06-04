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
import TableCell from "./TableCell";
import TableHeadCell from "./TableHeadCell";

export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  IComponentBaseProps & {
    active?: boolean;
    noCell?: boolean;
  };

const TableRow: Component<TableRowProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "active",
    "noCell",
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
            {(child, i) =>
              i() === 0 ? (
                <TableHeadCell>{child}</TableHeadCell>
              ) : (
                <TableCell>{child}</TableCell>
              )
            }
          </For>
        }
      >
        {resolved()}
      </Show>
    </tr>
  );
};

export default TableRow;
