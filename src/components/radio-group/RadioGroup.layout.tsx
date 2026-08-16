import "./RadioGroup.css";
import type { JSX } from "@solidjs/web";
import {Show, createSignal, createUniqueId, omit, type Component} from "solid-js";
import { twMerge } from "tailwind-merge";
import { RadioGroupContext, type RadioGroupContextValue } from "./context";
import type { UIBaseProps, State, Issue } from "../vocabulary";
import { CLASSES } from "./RadioGroup.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./RadioGroup.recipe";
import { resolveState } from "../vocabulary";

export type RadioGroupOrientation = "vertical" | "horizontal";
export type RadioGroupVariant = "primary" | "secondary";

export type RadioGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  UIBaseProps & {
    children: JSX.Element;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    name?: string;
    state?: State;
    disabled?: boolean;
    issues?: Issue[];
    orientation?: RadioGroupOrientation;
    variant?: RadioGroupVariant;
    label?: JSX.Element;
    description?: JSX.Element;
    errorMessage?: JSX.Element;
  };

const RadioGroup: Layout<typeof componentRecipe, RadioGroupProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "value",
    "defaultValue",
    "onChange",
    "name",
    "state",
    "disabled",
    "issues",
    "orientation",
    "variant",
    "label",
    "description",
    "errorMessage",
    "dataTheme",
    "aria-describedby",
    "aria-labelledby",
  );

  const baseId = createUniqueId();
  const generatedName = `${baseId}-radio-group`;
  const [internalValue, setInternalValue] = createSignal(props.defaultValue);

  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const orientation = () => props.orientation ?? "vertical";
  const variant = () => props.variant ?? "primary";
  const isControlled = () => props.value !== undefined;
  const selectedValue = () => (isControlled() ? props.value : internalValue());
  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled);
  const isInvalid = () => Boolean((resolveState(props.state, props.issues) === "invalid"));
  const name = () => props.name ?? generatedName;

  const handleChange = (nextValue: string) => {
    if (nextValue === selectedValue()) return;
    if (!isControlled()) {
      setInternalValue(nextValue);
    }
    props.onChange?.(nextValue);
  };

  const describedBy = () => {
    const ids = [local["aria-describedby"]];
    if (props.description) ids.push(descriptionId);
    if (props.errorMessage) ids.push(errorId);
    return ids.filter(Boolean).join(" ") || undefined;
  };

  const labelledBy = () => local["aria-labelledby"] ?? (props.label ? labelId : undefined);

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
    <RadioGroupContext value={contextValue}>
      <div
        {...others}
        role="radiogroup"
        aria-invalid={isInvalid() ? "true" : undefined}
        aria-labelledby={labelledBy()}
        aria-describedby={describedBy()}
        data-theme={props.dataTheme}
        data-slot="radio-group"
        data-orientation={orientation()}
        data-variant={variant()}
        data-disabled={isDisabled() ? "true" : "false"}
        data-invalid={isInvalid() ? "true" : "false"}
        {...{ class: twMerge(
          CLASSES.base,
          CLASSES.orientation[orientation()],
          CLASSES.variant[variant()],
          isDisabled() && CLASSES.flag.disabled,
          isInvalid() && CLASSES.flag.invalid,
          props.class,
        ) }}
      >
        <Show when={props.label}>
          <span id={labelId} {...{ class: CLASSES.slot.label }} data-slot="label">
            {props.label}
          </span>
        </Show>

        <Show when={props.description}>
          <span id={descriptionId} {...{ class: CLASSES.slot.description }} data-slot="description">
            {props.description}
          </span>
        </Show>

        <div {...{ class: CLASSES.slot.items }} data-slot="radio-group-items">
          {props.children}
        </div>

        <Show when={props.errorMessage}>
          <span id={errorId} {...{ class: CLASSES.slot.error }} data-slot="error-message">
            {props.errorMessage}
          </span>
        </Show>
      </div>
    </RadioGroupContext>
  );
};

export default RadioGroup;
