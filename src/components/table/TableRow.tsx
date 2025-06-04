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
      <Show when={local.noCell} fallback={resolved()}>
        {resolved()}
      </Show>
    </tr>
  );
};

export default TableRow;
