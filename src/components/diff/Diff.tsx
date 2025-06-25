import {
  createMemo,
  splitProps,
  type JSX,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";

export type DiffProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    secondItem: JSX.Element;
  };

const Diff = (props: DiffProps): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "secondItem",
    "className",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);
  const resolvedSecondItem = resolveChildren(() => local.secondItem);
  const classes = createMemo(() =>
    twMerge("diff aspect-[16/9]", local.class, local.className)
  );

  return (
    <div {...rest} class={classes()}>
      <div class="diff-item-1">{resolvedChildren()}</div>
      <div class="diff-item-2">{resolvedSecondItem()}</div>
      <div class="diff-resizer" />
    </div>
  );
};

export default Diff;
