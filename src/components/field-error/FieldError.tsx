import "./FieldError.css";
import { createMemo, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import { getFirstFieldError } from "../../hooks/form/getFirstFieldError";
import { useFormContext, type AnyFormApi } from "../../hooks/form";
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
    form?: AnyFormApi;
    showWhenTouched?: boolean;
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
    "name",
    "form",
    "showWhenTouched",
  ]);

  const hookMessage = createMemo(() => {
    if (!local.name) {
      return undefined;
    }

    const form = local.form ?? useFormContext();
    const fieldMeta = form._tsForm.getFieldMeta(local.name as never);

    if (!fieldMeta) {
      return undefined;
    }

    if ((local.showWhenTouched ?? true) && !fieldMeta.isTouched) {
      return undefined;
    }

    return getFirstFieldError((fieldMeta.errors ?? []) as unknown[]);
  });

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
