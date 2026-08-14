import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { UIBaseProps } from "../vocabulary";
import "./GlowCard.css";
import { CLASSES, componentRecipe } from "./GlowCard.recipe";
import type { Layout } from "../../lib/layouts";

export type GlowCardProps = UIBaseProps &
  JSX.HTMLAttributes<HTMLDivElement>;

const GlowCard: Layout<typeof componentRecipe, GlowCardProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
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
      class={twMerge(
        clsx(CLASSES.base, CLASSES.isolate, local.class),
      )}
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
};

export default GlowCard;
