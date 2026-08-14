import "./ScrollArea.css";
import { createEffect, createMemo, splitProps, type JSX } from "solid-js";
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
  const [local, others] = splitProps(props, [
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
  ]);

  let containerRef: HTMLDivElement | undefined;

  const size = () => local.size ?? 40;
  const offset = () => local.offset ?? 0;
  const variant = () => local.variant ?? "fade";
  const visibility = () => local.visibility ?? "auto";
  const orientation = () => local.orientation ?? "vertical";
  const isEnabled = () => local.isEnabled ?? true;

  useScrollArea({
    containerRef: () => containerRef,
    orientation,
    offset,
    visibility,
    isEnabled,
    onVisibilityChange: () => local.onVisibilityChange,
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
      local.hideScrollBar && CLASSES.flag.hideScrollBar,
      local.class,
    ),
  );

  const style = createMemo<JSX.CSSProperties | string>(() => {
    if (typeof local.style === "string") {
      const trimmed = local.style.trim();
      const suffix = trimmed.length > 0 && !trimmed.endsWith(";") ? ";" : "";
      return `${trimmed}${suffix} --scroll-area-size: ${size()}px;`;
    }

    return {
      ...(local.style ?? {}),
      "--scroll-area-size": `${size()}px`,
    } as JSX.CSSProperties;
  });

  return (
    <div
      {...others}
      ref={(el) => {
        containerRef = el;
        if (typeof local.ref === "function") local.ref(el);
      }}
      {...{ class: classes() }}
      data-theme={local.dataTheme}
      data-orientation={orientation()}
      data-scroll-area-size={size()}
      style={style()}
    >
      {local.children}
    </div>
  );
};

export default ScrollArea;

