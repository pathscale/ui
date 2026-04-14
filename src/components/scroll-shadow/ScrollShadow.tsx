import "./ScrollShadow.css";
import { createEffect, createMemo, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ScrollShadow.classes";
import {
  applyControlledScrollShadowVisibility,
  clearScrollShadowDataAttributes,
  useScrollShadow,
} from "./useScrollShadow";

export type ScrollShadowVisibility =
  | "auto"
  | "both"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "none";

export type ScrollShadowOrientation = "vertical" | "horizontal";
export type ScrollShadowVariant = "fade";

export type ScrollShadowProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "size"> & {
    size?: number;
    offset?: number;
    visibility?: ScrollShadowVisibility;
    isEnabled?: boolean;
    orientation?: ScrollShadowOrientation;
    variant?: ScrollShadowVariant;
    hideScrollBar?: boolean;
    onVisibilityChange?: (visibility: ScrollShadowVisibility) => void;
  };

const ScrollShadow = (props: ScrollShadowProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
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

  useScrollShadow({
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
      clearScrollShadowDataAttributes(el);
      return;
    }

    const currentVisibility = visibility();

    if (currentVisibility === "auto") return;

    applyControlledScrollShadowVisibility(el, currentVisibility, orientation());
  });

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.orientation[orientation()],
      CLASSES.variant[variant()],
      local.hideScrollBar && CLASSES.flag.hideScrollBar,
      local.class,
      local.className,
    ),
  );

  const style = createMemo<JSX.CSSProperties | string>(() => {
    if (typeof local.style === "string") {
      const trimmed = local.style.trim();
      const suffix = trimmed.length > 0 && !trimmed.endsWith(";") ? ";" : "";
      return `${trimmed}${suffix} --scroll-shadow-size: ${size()}px;`;
    }

    return {
      ...(local.style ?? {}),
      "--scroll-shadow-size": `${size()}px`,
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
      data-scroll-shadow-size={size()}
      style={style()}
    >
      {local.children}
    </div>
  );
};

export default ScrollShadow;

