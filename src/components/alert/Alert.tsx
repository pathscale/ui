import { type JSX, type Component, splitProps, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps, ComponentVariant } from "../types";
import { children as resolveChildren } from "solid-js";

export type ComponentStatus = "info" | "success" | "warning" | "error";
export type ComponentLayout = "vertical" | "horizontal";

export type AlertProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    icon?: JSX.Element;
    layout?: ComponentLayout;
    status?: ComponentStatus;
    variant?: ComponentVariant;
    "aria-atomic"?: boolean;
    "aria-live"?: "off" | "polite" | "assertive";
    "aria-relevant"?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

const Alert: Component<AlertProps> = (props) => {
  const [local, others] = splitProps(props, [
    "icon",
    "layout",
    "status",
    "variant",
    "dataTheme",
    "class",
    "className",
    "style",
    "children",
    "aria-atomic",
    "aria-live",
    "aria-relevant",
    "aria-label",
    "aria-labelledby",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      "alert",
      local.class,
      local.className,
      clsx({
        "alert-vertical": local.layout === "vertical",
        "alert-horizontal": local.layout === "horizontal",
        "alert-info": local.status === "info",
        "alert-success": local.status === "success",
        "alert-warning": local.status === "warning",
        "alert-error": local.status === "error",
        "alert-soft": local.variant === "soft",
        "alert-dash": local.variant === "dash",
        "alert-outline": local.variant === "outline",
      })
    )
  );

  const role = "alert";
  const ariaAtomic = createMemo(() =>
    local["aria-atomic"] === undefined ? true : local["aria-atomic"]
  );
  const ariaLive = createMemo(() => local["aria-live"] || "assertive");
  const ariaRelevant = createMemo(() => local["aria-relevant"]);
  const ariaLabel = createMemo(() => local["aria-label"]);
  const ariaLabelledby = createMemo(() => local["aria-labelledby"]);

  return (
    <div
      role={role}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
      aria-atomic={ariaAtomic()}
      aria-live={ariaLive()}
      aria-relevant={ariaRelevant()}
      aria-label={ariaLabel()}
      aria-labelledby={ariaLabelledby()}
    >
      {local.icon}
      {resolvedChildren()}
    </div>
  );
};

export default Alert;
