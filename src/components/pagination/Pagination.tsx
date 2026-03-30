import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Join, { type JoinProps } from "../join/Join";

export type PaginationProps = JoinProps;

const Pagination = (props: PaginationProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <Join
      {...others}
      class={twMerge(local.class, local.className)}
    />
  );
};

export default Pagination;
