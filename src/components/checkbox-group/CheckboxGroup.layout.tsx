import "./CheckboxGroup.css";
import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { CheckboxVariant } from "../checkbox";
import type { UIBaseProps, State, Issue } from "../vocabulary";
import { CLASSES } from "./CheckboxGroup.recipe";
import { CheckboxGroupContext, type CheckboxGroupContextValue } from "./context";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./CheckboxGroup.recipe";
import { resolveState } from "../vocabulary";

export type CheckboxGroupVariant = CheckboxVariant;

export type CheckboxGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  UIBaseProps & {
    children?: JSX.Element | ((values: string[]) => JSX.Element);
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    name?: string;
    state?: State;
    disabled?: boolean;
    issues?: Issue[];
    variant?: CheckboxGroupVariant;
  };

const CheckboxGroup: Layout<typeof componentRecipe, CheckboxGroupProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "value",
    "defaultValue",
    "onChange",
    "name",
    "state",
    "disabled",
    "issues",
    "variant",
    "role",
  ]);

  const [internalValue, setInternalValue] = createSignal<string[]>(local.defaultValue ?? []);

  const isControlled = () => local.value !== undefined;
  const selectedValues = () => (isControlled() ? local.value ?? [] : internalValue());
  const variant = () => local.variant ?? "primary";
  const isDisabled = () => Boolean((local.state === "disabled")) || Boolean(local.disabled);
  const isInvalid = () => Boolean((resolveState(local.state, local.issues) === "invalid"));

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
          CLASSES.base,
          CLASSES.variant[variant()],
          isDisabled() && CLASSES.flag.disabled,
          isInvalid() && CLASSES.flag.invalid,
          local.class,
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
