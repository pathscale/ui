import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";
import "./GlowCard.css";

export type GlowCardProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement>;

export default function GlowCard(props: GlowCardProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "onMouseMove",
    "style",
  ]);

  const handleMouseMove: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);

    if (Array.isArray(local.onMouseMove)) {
      const [handler, data] = local.onMouseMove;
      handler(data, e);
    } else if (typeof local.onMouseMove === "function") {
      (local.onMouseMove as JSX.EventHandler<HTMLDivElement, MouseEvent>)(e);
    }
  };

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={twMerge(clsx("glow-card isolate", local.class, local.className))}
      style={local.style}
      onMouseMove={handleMouseMove}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty("--mouse-x", "50%");
        e.currentTarget.style.setProperty("--mouse-y", "50%");
      }}
    >
      {local.children}
    </div>
  );
}
