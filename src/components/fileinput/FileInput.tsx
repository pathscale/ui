import { splitProps, type JSX, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type FileInputBaseProps = {
  size?: ComponentSize;
  color?: ComponentColor;
  bordered?: boolean;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type FileInputProps = FileInputBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof FileInputBaseProps>;

const FileInput = (props: FileInputProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "color",
    "bordered",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = createMemo(() =>
    twMerge(
      "file-input",
      local.class,
      local.className,
      clsx({
        "file-input-xl": local.size === "xl",
        "file-input-lg": local.size === "lg",
        "file-input-md": local.size === "md",
        "file-input-sm": local.size === "sm",
        "file-input-xs": local.size === "xs",
        "file-input-primary": local.color === "primary",
        "file-input-secondary": local.color === "secondary",
        "file-input-accent": local.color === "accent",
        "file-input-ghost": local.color === "ghost",
        "file-input-info": local.color === "info",
        "file-input-success": local.color === "success",
        "file-input-warning": local.color === "warning",
        "file-input-error": local.color === "error",
        "file-input-bordered": local.bordered,
      }),
    ),
  );

  return (
    <input
      {...others}
      type="file"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    />
  );
};

export default FileInput;
