import { type Component, splitProps, JSX } from "solid-js";

export type TableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement>;

const TableBody: Component<TableBodyProps> = (props) => {
  const [local, rest] = splitProps(props, ["children"]);

  return <tbody {...rest}>{local.children}</tbody>;
};

export default TableBody;
