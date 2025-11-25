import type { JSX, Component } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export type DockLabelProps = JSX.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
};

const DockLabel: Component<DockLabelProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className"]);

  const classes = twMerge("dock-label", local.class, local.className);

  return (
    <span
      {...others}
      class={classes}
    >
      {local.children}
    </span>
  );
};

export default DockLabel;
