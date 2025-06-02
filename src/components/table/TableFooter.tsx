import {
  type Component,
  splitProps,
  children as resolveChildren,
  JSX,
  For,
  Show,
} from "solid-js";
import { type IComponentBaseProps } from "../types";

export type TableFooterProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  IComponentBaseProps & {
    noCell?: boolean;
  };

const TableFooter: Component<TableFooterProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "noCell"]);
  const resolved = resolveChildren(() => local.children);

  return (
    <tfoot {...rest}>
      <tr>
        <Show
          when={local.noCell}
          fallback={
            <For each={resolved.toArray()}>
              {(child, i) => (i() === 0 ? <th>{child}</th> : <td>{child}</td>)}
            </For>
          }
        >
          {resolved()}
        </Show>
      </tr>
    </tfoot>
  );
};

export default TableFooter;
