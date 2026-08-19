import "./CheckboxGroup.css";
import type { JSX } from "@solidjs/web";
import { type Component, createSignal, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { CheckboxVariant } from "../checkbox";
import type { Issue, State, UIBaseProps } from "../vocabulary";
import { resolveState } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./CheckboxGroup.recipe";
import {
  CheckboxGroupContext,
  type CheckboxGroupContextValue,
} from "./context";

export type CheckboxGroupVariant = CheckboxVariant;

export type CheckboxGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> &
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

const CheckboxGroup: Layout<
  typeof componentRecipe,
  CheckboxGroupProps
> = () => {
  const others = omit(
    props,
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
  );

  const [internalValue, setInternalValue] = createSignal<string[]>(
    props.defaultValue ?? [],
  );

  const isControlled = () => props.value !== undefined;
  const selectedValues = () =>
    isControlled() ? (props.value ?? []) : internalValue();
  const variant = () => props.variant ?? "primary";
  const isDisabled = () =>
    Boolean(props.state === "disabled") || Boolean(props.disabled);
  const isInvalid = () =>
    Boolean(resolveState(props.state, props.issues) === "invalid");

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

    props.onChange?.(nextValues);
  };

  const contextValue: CheckboxGroupContextValue = {
    value: selectedValues,
    name: () => props.name,
    variant,
    isDisabled,
    isInvalid,
    toggleValue: (optionValue, checked, event) => {
      if (event.defaultPrevented || isDisabled()) return;
      handleToggle(optionValue, checked);
    },
  };

  return (
    <CheckboxGroupContext value={contextValue}>
      <div
        {...others}
        role={props.role ?? "group"}
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
          props.class,
        )}
        data-theme={props.dataTheme}
        style={props.style}
      >
        {typeof props.children === "function"
          ? props.children(selectedValues())
          : props.children}
      </div>
    </CheckboxGroupContext>
  );
};

export default CheckboxGroup;
