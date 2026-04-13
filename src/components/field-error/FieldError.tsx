import "./FieldError.css";
import { createMemo, splitProps, type Accessor, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { FormController } from "../../hooks/form";
import { useFieldError } from "../../hooks/form";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./FieldError.classes";

export type FieldErrorRenderProps = {
  isVisible: boolean;
};

export type FieldErrorRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: FieldErrorRenderProps) => JSX.Element);
    isVisible?: boolean;
    name?: string;
    form?: FormController<Record<string, unknown>> | Accessor<FormController<Record<string, unknown>> | undefined>;
    showWhenTouched?: boolean;
  };

const FieldErrorRoot: Component<FieldErrorRootProps> = (props) => {
  let rootRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "slot",
    "isVisible",
    "name",
    "form",
    "showWhenTouched",
  ]);

  const hookError = useFieldError(
    () => local.name,
    {
      form: local.form,
      element: () => rootRef,
      showWhenTouched: local.showWhenTouched,
    },
  );

  const hookMessage = createMemo(() => hookError());

  const isVisible = () => {
    if (typeof local.isVisible === "boolean") {
      return local.isVisible;
    }

    if (hookMessage()) {
      return true;
    }

    return local.children != null;
  };

  const content = () => {
    if (typeof local.children === "function") {
      return local.children({ isVisible: isVisible() });
    }

    if (local.children != null) {
      return local.children;
    }

    return hookMessage();
  };

  return (
    <div
      ref={rootRef}
      {...others}
      {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
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
