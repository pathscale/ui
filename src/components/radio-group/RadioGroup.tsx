import "./RadioGroup.css";
import { Show, createSignal, createUniqueId, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { RadioGroupContext, type RadioGroupContextValue } from "./context";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./RadioGroup.classes";

export type RadioGroupOrientation = "vertical" | "horizontal";
export type RadioGroupVariant = "primary" | "secondary";

export type RadioGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    children: JSX.Element;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    name?: string;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    orientation?: RadioGroupOrientation;
    variant?: RadioGroupVariant;
    label?: JSX.Element;
    description?: JSX.Element;
    errorMessage?: JSX.Element;
  };

const RadioGroup: Component<RadioGroupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "value",
    "defaultValue",
    "onChange",
    "name",
    "isDisabled",
    "disabled",
    "isInvalid",
    "orientation",
    "variant",
    "label",
    "description",
    "errorMessage",
    "dataTheme",
    "aria-describedby",
    "aria-labelledby",
  ]);

  const baseId = createUniqueId();
  const generatedName = `${baseId}-radio-group`;
  const [internalValue, setInternalValue] = createSignal(local.defaultValue);

  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const orientation = () => local.orientation ?? "vertical";
  const variant = () => local.variant ?? "primary";
  const isControlled = () => local.value !== undefined;
  const selectedValue = () => (isControlled() ? local.value : internalValue());
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid);
  const name = () => local.name ?? generatedName;

  const handleChange = (nextValue: string) => {
    if (nextValue === selectedValue()) return;
    if (!isControlled()) {
      setInternalValue(nextValue);
    }
    local.onChange?.(nextValue);
  };

  const describedBy = () => {
    const ids = [local["aria-describedby"]];
    if (local.description) ids.push(descriptionId);
    if (local.errorMessage) ids.push(errorId);
    return ids.filter(Boolean).join(" ") || undefined;
  };

  const labelledBy = () => local["aria-labelledby"] ?? (local.label ? labelId : undefined);

  const contextValue: RadioGroupContextValue = {
    name,
    value: selectedValue,
    isDisabled,
    isInvalid,
    selectValue: (value, event) => {
      if (isDisabled() || event.defaultPrevented) return;
      handleChange(value);
    },
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        {...others}
        role="radiogroup"
        aria-invalid={isInvalid() ? "true" : undefined}
        aria-labelledby={labelledBy()}
        aria-describedby={describedBy()}
        data-theme={local.dataTheme}
        data-slot="radio-group"
        data-orientation={orientation()}
        data-variant={variant()}
        data-disabled={isDisabled() ? "true" : "false"}
        data-invalid={isInvalid() ? "true" : "false"}
        class={twMerge(
          CLASSES.base,
          CLASSES.orientation[orientation()],
          CLASSES.variant[variant()],
          isDisabled() && CLASSES.flag.disabled,
          isInvalid() && CLASSES.flag.invalid,
          local.class,
          local.className,
        )}
      >
        <Show when={local.label}>
          <span id={labelId} class={CLASSES.slot.label} data-slot="label">
            {local.label}
          </span>
        </Show>

        <Show when={local.description}>
          <span id={descriptionId} class={CLASSES.slot.description} data-slot="description">
            {local.description}
          </span>
        </Show>

        <div class={CLASSES.slot.items} data-slot="radio-group-items">
          {local.children}
        </div>

        <Show when={local.errorMessage}>
          <span id={errorId} class={CLASSES.slot.error} data-slot="error-message">
            {local.errorMessage}
          </span>
        </Show>
      </div>
    </RadioGroupContext.Provider>
  );
};

export default RadioGroup;
