import { type Component, splitProps, JSX, For } from "solid-js";

export type TableHeadProps = JSX.HTMLAttributes<HTMLTableSectionElement> & {
  children?: JSX.Element | JSX.Element[];
  noCell?: boolean;
};

const TableHead: Component<TableHeadProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "noCell"]);

  return <thead {...rest}>{local.children}</thead>;
};

export default TableHead;
