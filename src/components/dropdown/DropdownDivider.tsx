import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type DropdownDividerProps = JSX.HTMLAttributes<HTMLLIElement> &
  IComponentBaseProps;

const DropdownDivider = (props: DropdownDividerProps): JSX.Element => {
  const classes = twMerge("divider my-1", props.class);

  return <li {...props} class={classes} role="separator" />;
};

export default DropdownDivider;
