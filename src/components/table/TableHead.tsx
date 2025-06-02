import { type Component, splitProps, JSX, For } from "solid-js";

export type TableHeadProps = JSX.HTMLAttributes<HTMLTableSectionElement> & {
  children?: JSX.Element | JSX.Element[];
  noCell?: boolean;
};

const TableHead: Component<TableHeadProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "noCell"]);

  return (
    <thead {...rest}>
      <tr>
        <For
          each={
            Array.isArray(local.children) ? local.children : [local.children]
          }
        >
          {(child, index) =>
            local.noCell ? (
              child
            ) : index() < 1 ? (
              <th>{child}</th>
            ) : (
              <td>{child}</td>
            )
          }
        </For>
      </tr>
    </thead>
  );
};

export default TableHead;
