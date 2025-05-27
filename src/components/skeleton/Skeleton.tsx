import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type SkeletonProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const Skeleton = (props: SkeletonProps) => {
  const [local, others] = splitProps(props, [
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const classes = twMerge("skeleton", local.class, local.className);

  return (
    <div {...others} data-theme={local.dataTheme} class={classes}>
      {local.children}
    </div>
  );
};

export default Skeleton;
