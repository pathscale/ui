import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import { clsx } from "clsx";

import type { UIBaseProps } from "../vocabulary";
import "./GlowCard.css";
import { CLASSES, componentRecipe } from "./GlowCard.recipe";
import type { Layout } from "../../lib/layouts";

export type GlowCardProps = UIBaseProps &
  JSX.HTMLAttributes<HTMLDivElement>;

const GlowCard: Layout<typeof componentRecipe, GlowCardProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "onMouseMove", "style");

  const handleMouseMove: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);

    if (Array.isArray(props.onMouseMove)) {
      const [handler, data] = props.onMouseMove;
      handler(data, e);
    } else if (typeof props.onMouseMove === "function") {
      (props.onMouseMove as JSX.EventHandler<HTMLDivElement, MouseEvent>)(e);
    }
  };

  return (
    <div
      {...others}
      data-theme={props.dataTheme}
      class={twMerge(
        clsx(CLASSES.base, CLASSES.isolate, props.class),
      )}
      style={props.style}
      onMouseMove={handleMouseMove}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty("--mouse-x", "50%");
        e.currentTarget.style.setProperty("--mouse-y", "50%");
      }}
    >
      {props.children}
    </div>
  );
};

export default GlowCard;
