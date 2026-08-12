import "./Icon.css";
import type { Layout } from "solid-layouts";
import { twMerge } from "tailwind-merge";
import { icon } from "./Icon.recipe";

export const IconLayout: Layout<typeof icon> = ({ slot }, props) => (
  <span
    {...slot.root}
    class={twMerge(slot.root.class, props.name)}
    style={{
      width: `${props.width ?? 24}px`,
      height: `${props.height ?? 24}px`,
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);
