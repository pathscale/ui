import "./CheckboxGroup.css";
import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { CheckboxVariant } from "../checkbox";
import type { IComponentBaseProps } from "../types";
import { CheckboxGroupContext, type CheckboxGroupContextValue } from "./context";

export type CheckboxGroupVariant = CheckboxVariant;

const VARIANT_CLASS_MAP: Record<CheckboxGroupVariant, string> = {
  primary: "checkbox-group--primary",
  secondary: "checkbox-group--secondary",
};

export type CheckboxGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((values: string[]) => JSX.Element);
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    name?: string;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    variant?: CheckboxGroupVariant;
  };

const CheckboxGroup: Component<CheckboxGroupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "value",
    "defaultValue",
    "onChange",
    "name",
    "isDisabled",
    "disabled",
    "isInvalid",
    "variant",
    "role",
  ]);

  const [internalValue, setInternalValue] = createSignal<string[]>(local.defaultValue ?? []);

  const isControlled = () => local.value !== undefined;
  const selectedValues = () => (isControlled() ? local.value ?? [] : internalValue());
  const variant = () => local.variant ?? "primary";
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid);

  const handleToggle = (optionValue: string, checked: boolean) => {
    const currentValues = selectedValues();
    const nextValues = checked
      ? currentValues.includes(optionValue)
        ? currentValues
        : [...currentValues, optionValue]
      : currentValues.filter((value) => value !== optionValue);

    if (!isControlled()) {
      setInternalValue(nextValues);
    }

    local.onChange?.(nextValues);
  };

  const contextValue: CheckboxGroupContextValue = {
    value: selectedValues,
    name: () => local.name,
    variant,
    isDisabled,
    isInvalid,
    toggleValue: (optionValue, checked, event) => {
      if (event.defaultPrevented || isDisabled()) return;
      handleToggle(optionValue, checked);
    },
  };

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div
        {...others}
        role={local.role ?? "group"}
        aria-disabled={isDisabled() ? "true" : undefined}
        aria-invalid={isInvalid() ? "true" : undefined}
        data-slot="checkbox-group"
        data-variant={variant()}
        data-disabled={isDisabled() ? "true" : "false"}
        data-invalid={isInvalid() ? "true" : "false"}
        class={twMerge(
          "checkbox-group",
          VARIANT_CLASS_MAP[variant()],
          isDisabled() && "checkbox-group--disabled",
          isInvalid() && "checkbox-group--invalid",
          local.class,
          local.className,
        )}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {typeof local.children === "function" ? local.children(selectedValues()) : local.children}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

export default CheckboxGroup;
