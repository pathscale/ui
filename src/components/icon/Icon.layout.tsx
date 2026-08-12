import "./Icon.css";
import type { JSX } from "solid-js";
import type { Layout } from "solid-layouts";
import type { icon } from "./Icon.recipe";

export const IconLayout: Layout<typeof icon> = ({ slot }, props) => (
  <span
    {...slot.root}
    class={[slot.root.class, props.name].filter(Boolean).join(" ")}
    style={{
      width: `${props.width ?? 24}px`,
      height: `${props.height ?? 24}px`,
      ...(typeof props.style === "object" ? (props.style as JSX.CSSProperties) : {}),
    }}
  />
);
