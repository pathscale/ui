import "./FieldError.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type FieldErrorRenderProps = {
  isVisible: boolean;
};

export type FieldErrorRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: FieldErrorRenderProps) => JSX.Element);
    isVisible?: boolean;
  };

const FieldErrorRoot: Component<FieldErrorRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "slot",
    "isVisible",
  ]);

  const isVisible = () => local.isVisible ?? local.children != null;

  const content = () => {
    if (typeof local.children === "function") {
      return local.children({ isVisible: isVisible() });
    }

    return local.children;
  };

  return (
    <div
      {...others}
      class={twMerge("field-error", local.class, local.className)}
      data-slot="field-error"
      data-visible={isVisible() ? "true" : "false"}
      slot={local.slot ?? "errorMessage"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {content()}
    </div>
  );
};

const FieldError = Object.assign(FieldErrorRoot, {
  Root: FieldErrorRoot,
});

export default FieldError;
export { FieldError, FieldErrorRoot };
export type { FieldErrorRootProps as FieldErrorProps };
