import "./ErrorMessage.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ErrorMessage.classes";

export type ErrorMessageRootProps = JSX.HTMLAttributes<HTMLSpanElement> & IComponentBaseProps;

const ErrorMessageRoot: Component<ErrorMessageRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "slot",
  ]);

  return (
    <span
      {...others}
      class={twMerge(CLASSES.base, local.class, local.className)}
      data-slot="error-message"
      slot={local.slot ?? "errorMessage"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </span>
  );
};

const ErrorMessage = Object.assign(ErrorMessageRoot, {
  Root: ErrorMessageRoot,
});

export default ErrorMessage;
export { ErrorMessage, ErrorMessageRoot };
export type { ErrorMessageRootProps as ErrorMessageProps };
