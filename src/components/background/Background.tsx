import type { Component, JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { splitProps } from "solid-js";
import { createMemo } from "solid-js";

export type BackgroundProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement>;

const Background: Component<BackgroundProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className"]);

  const classes = createMemo(() =>
    twMerge("bg-base-100 min-h-screen", local.class, local.className)
  );

  return <div class={classes()} {...others} />;
};

export default Background;
