import type { JSX } from "solid-js";
import { splitProps, createMemo, children as resolveChildren } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type SkeletonProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const Skeleton = (props: SkeletonProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);
  const classes = createMemo(() =>
    twMerge("skeleton", local.class, local.className),
  );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {resolvedChildren()}
    </div>
  );
};

export default Skeleton;
