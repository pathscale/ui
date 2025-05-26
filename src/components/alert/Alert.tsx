import { type JSX, type Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";

export type ComponentStatus = "info" | "success" | "warning" | "error";
export type ComponentLayout = "vertical" | "horizontal";
export type ComponentVariant = "soft" | "dash" | "outline";

export type AlertProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    icon?: JSX.Element;
    layout?: ComponentLayout;
    status?: ComponentStatus;
    variant?: ComponentVariant;
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
  ]);

  const classes = () =>
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
    );

  return (
    <div
      role="alert"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.icon}
      {props.children}
    </div>
  );
};

export default Alert;
