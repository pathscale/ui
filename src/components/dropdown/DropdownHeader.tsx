import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type DropdownHeaderProps = JSX.HTMLAttributes<HTMLLIElement> &
  IComponentBaseProps;

const DropdownHeader = (props: DropdownHeaderProps): JSX.Element => {
  const classes = twMerge(
    "dropdown-header font-semibold text-xs uppercase py-2 px-4 opacity-70",
    props.class
  );

  return <li {...props} class={classes} role="presentation" />;
};

export default DropdownHeader;
