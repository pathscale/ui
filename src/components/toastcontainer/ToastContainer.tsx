import { type Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import ToastStack from "./ToastStack";
import type { ToastStackProps } from "./ToastStack";

export const ToastContainer: Component<ToastStackProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <ToastStack {...rest} class={twMerge(local.class)} />;
};
