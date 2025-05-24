import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type DropdownMenuProps = JSX.HTMLAttributes<HTMLUListElement> &
  IComponentBaseProps & {
    class?: string;
    className?: string;
    style?: JSX.CSSProperties;
    "data-theme"?: string;
  };

const DropdownMenu = (props: DropdownMenuProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "data-theme",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "dropdown-content menu p-2 shadow bg-base-100 rounded-box",
      local.class,
      local.className
    );

  return (
    <ul
      {...others}
      tabindex={0}
      data-theme={local["data-theme"]}
      class={classes()}
      style={local.style}
      role="menu"
    />
  );
};

export default DropdownMenu;
