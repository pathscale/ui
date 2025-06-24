import { createMemo, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";

export type DiffProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps & {
  secondItem: JSX.Element;
};

const Diff = (props: DiffProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "secondItem",
    "className"
  ]);

const classes = createMemo(() => twMerge("diff aspect-[16/9]", local.class, local.className))

  return (
    <div
      {...rest}
      class={classes()}
    >
      <div class="diff-item-1">{local.children}</div>
      <div class="diff-item-2">{local.secondItem}</div>
      <div class="diff-resizer" />
    </div>
  );
};

export default Diff;
