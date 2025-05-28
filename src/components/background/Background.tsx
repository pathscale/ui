import {
  type JSX,
  splitProps,
  Show,
  children as resolveChildren,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type BackgroundProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLElement> & {
    as?: keyof JSX.IntrinsicElements;
    children?: JSX.Element;
  };

const Background = (props: BackgroundProps) => {
  const [local, rest] = splitProps(props, [
    "as",
    "class",
    "children",
    "className",
  ]);
  const tag = local.as || "div";
  const resolvedChildren = resolveChildren(() => local.children);

  return (
    <Dynamic
      component={tag}
      class={twMerge(
        clsx("bg-base-100 text-base-content", local.class, local.className)
      )}
      {...rest}
    >
      <Show when={resolvedChildren()}>{resolvedChildren()}</Show>
    </Dynamic>
  );
};

export default Background;
