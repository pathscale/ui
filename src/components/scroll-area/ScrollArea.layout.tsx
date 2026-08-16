import "./ScrollArea.css";
import type { JSX } from "@solidjs/web";
import {createEffect, createMemo, omit} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ScrollArea.recipe";
import {
  applyControlledScrollAreaVisibility,
  clearScrollAreaDataAttributes,
  useScrollArea,
} from "./useScrollArea";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ScrollArea.recipe";

export type ScrollAreaVisibility =
  | "auto"
  | "both"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "none";

export type ScrollAreaOrientation = "vertical" | "horizontal";
export type ScrollAreaVariant = "fade";

export type ScrollAreaProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "size"> & {
    size?: number;
    offset?: number;
    visibility?: ScrollAreaVisibility;
    isEnabled?: boolean;
    orientation?: ScrollAreaOrientation;
    variant?: ScrollAreaVariant;
    hideScrollBar?: boolean;
    onVisibilityChange?: (visibility: ScrollAreaVisibility) => void;
  };

const ScrollArea: Layout<typeof componentRecipe, ScrollAreaProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "size",
    "offset",
    "visibility",
    "isEnabled",
    "orientation",
    "variant",
    "hideScrollBar",
    "onVisibilityChange",
    "ref",
  );

  let containerRef: HTMLDivElement | undefined;

  const size = () => props.size ?? 40;
  const offset = () => props.offset ?? 0;
  const variant = () => props.variant ?? "fade";
  const visibility = () => props.visibility ?? "auto";
  const orientation = () => props.orientation ?? "vertical";
  const isEnabled = () => props.isEnabled ?? true;

  useScrollArea({
    containerRef: () => containerRef,
    orientation,
    offset,
    visibility,
    isEnabled,
    onVisibilityChange: () => props.onVisibilityChange,
  });

  createEffect(() => {
    const el = containerRef;

    if (!el) return;

    if (!isEnabled()) {
      clearScrollAreaDataAttributes(el);
      return;
    }

    const currentVisibility = visibility();

    if (currentVisibility === "auto") return;

    applyControlledScrollAreaVisibility(el, currentVisibility, orientation());
  });

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.orientation[orientation()],
      CLASSES.variant[variant()],
      props.hideScrollBar && CLASSES.flag.hideScrollBar,
      props.class,
    ),
  );

  const style = createMemo<JSX.CSSProperties | string>(() => {
    if (typeof props.style === "string") {
      const trimmed = props.style.trim();
      const suffix = trimmed.length > 0 && !trimmed.endsWith(";") ? ";" : "";
      return `${trimmed}${suffix} --scroll-area-size: ${size()}px;`;
    }

    return {
      ...(props.style ?? {}),
      "--scroll-area-size": `${size()}px`,
    } as JSX.CSSProperties;
  });

  return (
    <div
      {...others}
      ref={(el) => {
        containerRef = el;
        if (typeof props.ref === "function") props.ref(el);
      }}
      {...{ class: classes() }}
      data-theme={props.dataTheme}
      data-orientation={orientation()}
      data-scroll-area-size={size()}
      style={style()}
    >
      {props.children}
    </div>
  );
};

export default ScrollArea;

