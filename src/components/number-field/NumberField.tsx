import "./NumberField.css";
import {
  createContext,
  createEffect,
  createSignal,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./NumberField.classes";

export type NumberFieldVariant = "primary" | "secondary";

type NumberFieldContextValue = {
  valueText: Accessor<string>;
  name: Accessor<string | undefined>;
  variant: Accessor<NumberFieldVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  min: Accessor<number | undefined>;
  max: Accessor<number | undefined>;
  step: Accessor<number>;
  onBlur: Accessor<JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined>;
  setFromInput: (nextValue: string, event?: Event) => void;
  increment: (event?: Event) => void;
  decrement: (event?: Event) => void;
};

const NumberFieldContext = createContext<NumberFieldContextValue>();

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const toNumber = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const clamp = (value: number, min?: number, max?: number) => {
  let clampedValue = value;

  if (min !== undefined && clampedValue < min) {
    clampedValue = min;
  }

  if (max !== undefined && clampedValue > max) {
    clampedValue = max;
  }

  return clampedValue;
};

const formatNumber = (value: number | undefined) => (value === undefined ? "" : `${value}`);

export type NumberFieldRenderProps = {
  value: number | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
};

export type NumberFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onBlur"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: NumberFieldRenderProps) => JSX.Element);
    name?: string;
    value?: number;
    defaultValue?: number;
    onChange?: (value: number | undefined) => void;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    min?: number;
    max?: number;
    step?: number;
    fullWidth?: boolean;
    variant?: NumberFieldVariant;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
  };

export type NumberFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: NumberFieldRenderProps) => JSX.Element);
  };

export type NumberFieldInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "type"
> &
  IComponentBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type NumberFieldIncrementButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> &
  IComponentBaseProps;

export type NumberFieldDecrementButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> &
  IComponentBaseProps;

const NumberFieldRoot: ParentComponent<NumberFieldRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "name",
    "value",
    "defaultValue",
    "onChange",
    "onBlur",
    "min",
    "max",
    "step",
    "fullWidth",
    "variant",
    "isDisabled",
    "disabled",
    "isInvalid",
  ]);

  const [internalValue, setInternalValue] = createSignal<number | undefined>(local.defaultValue);
  const [inputValue, setInputValue] = createSignal<string>(formatNumber(local.defaultValue));

  const isControlled = () => local.value !== undefined;
  const value = () => (isControlled() ? local.value : internalValue());
  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid);
  const step = () => (local.step && Number.isFinite(local.step) ? local.step : 1);
  const min = () => local.min;
  const max = () => local.max;

  createEffect(() => {
    if (!isControlled()) return;
    setInputValue(formatNumber(local.value));
  });

  const commitValue = (nextValue: number | undefined) => {
    if (!isControlled()) {
      setInternalValue(nextValue);
    }

    setInputValue(formatNumber(nextValue));
    local.onChange?.(nextValue);
  };

  const setFromInput = (nextValue: string) => {
    setInputValue(nextValue);

    const parsedValue = toNumber(nextValue);
    if (nextValue.trim() === "") {
      if (!isControlled()) {
        setInternalValue(undefined);
      }
      local.onChange?.(undefined);
      return;
    }

    if (parsedValue === undefined) return;

    const clampedValue = clamp(parsedValue, min(), max());
    if (!isControlled()) {
      setInternalValue(clampedValue);
    }
    local.onChange?.(clampedValue);
  };

  const adjustValue = (direction: 1 | -1) => {
    if (isDisabled()) return;

    const currentValue =
      toNumber(inputValue()) ?? value() ?? min() ?? (direction > 0 ? 0 : step() > 0 ? step() : 0);
    const nextValue = clamp(currentValue + step() * direction, min(), max());
    commitValue(nextValue);
  };

  const renderProps = () => ({
    value: value(),
    isInvalid: isInvalid(),
    isDisabled: isDisabled(),
  });

  const contextValue: NumberFieldContextValue = {
    valueText: inputValue,
    name: () => local.name,
    variant,
    fullWidth,
    isDisabled,
    isInvalid,
    min,
    max,
    step,
    onBlur: () => local.onBlur,
    setFromInput,
    increment: () => adjustValue(1),
    decrement: () => adjustValue(-1),
  };

  return (
    <NumberFieldContext.Provider value={contextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          local.class,
          local.className,
        ) }}
        data-slot="number-field"
        data-invalid={isInvalid() ? "true" : undefined}
        data-disabled={isDisabled() ? "true" : undefined}
        aria-invalid={isInvalid() ? "true" : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {typeof local.children === "function" ? (
          local.children(renderProps())
        ) : local.children ? (
          local.children
        ) : (
          <NumberFieldGroup>
            <NumberFieldDecrementButton />
            <NumberFieldInput />
            <NumberFieldIncrementButton />
          </NumberFieldGroup>
        )}
      </div>
    </NumberFieldContext.Provider>
  );
};

const NumberFieldGroup: ParentComponent<NumberFieldGroupProps> = (props) => {
  const context = useContext(NumberFieldContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  const renderProps = () => ({
    value: toNumber(context?.valueText() ?? ""),
    isInvalid: context?.isInvalid() ?? false,
    isDisabled: context?.isDisabled() ?? false,
  });

  return (
    <div
      {...others}
      {...{ class: twMerge(
        CLASSES.Group.base,
        context?.fullWidth() && CLASSES.Group.flag.fullWidth,
        local.class,
        local.className,
      ) }}
      data-slot="number-field-group"
      data-invalid={context?.isInvalid() ? "true" : undefined}
      data-disabled={context?.isDisabled() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {typeof local.children === "function" ? local.children(renderProps()) : local.children}
    </div>
  );
};

const NumberFieldInput: Component<NumberFieldInputProps> = (props) => {
  const context = useContext(NumberFieldContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "onInput",
    "onBlur",
    "name",
  ]);

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    invokeEventHandler(local.onInput, event);
    if (event.defaultPrevented) return;
    context?.setFromInput(event.currentTarget.value, event);
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onBlur, event);
    invokeEventHandler(context?.onBlur(), event);
  };

  return (
    <input
      {...others}
      type="text"
      inputmode="decimal"
      {...{ class: twMerge(CLASSES.Input.base, local.class, local.className) }}
      data-slot="number-field-input"
      data-theme={local.dataTheme}
      style={local.style}
      name={local.name ?? context?.name()}
      value={context?.valueText() ?? ""}
      disabled={context?.isDisabled()}
      aria-invalid={context?.isInvalid() ? "true" : undefined}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      min={context?.min()}
      max={context?.max()}
      step={context?.step()}
      onInput={handleInput}
      onBlur={handleBlur}
    />
  );
};

const NumberFieldIncrementButton: Component<NumberFieldIncrementButtonProps> = (props) => {
  const context = useContext(NumberFieldContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style", "onClick"]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    context?.increment(event);
  };

  return (
    <button
      {...others}
      type="button"
      {...{ class: twMerge(CLASSES.IncrementButton.base, local.class, local.className) }}
      data-slot="number-field-increment-button"
      data-theme={local.dataTheme}
      style={local.style}
      disabled={context?.isDisabled()}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      slot="increment"
      onClick={handleClick}
    >
      {local.children ?? (
        <svg
          aria-hidden="true"
          data-slot="number-field-increment-button-icon"
          fill="none"
          role="presentation"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 3.25a.75.75 0 0 1 .75.75v3.25H12a.75.75 0 0 1 0 1.5H8.75V12a.75.75 0 0 1-1.5 0V8.75H4a.75.75 0 0 1 0-1.5h3.25V4A.75.75 0 0 1 8 3.25Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
};

const NumberFieldDecrementButton: Component<NumberFieldDecrementButtonProps> = (props) => {
  const context = useContext(NumberFieldContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style", "onClick"]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    context?.decrement(event);
  };

  return (
    <button
      {...others}
      type="button"
      {...{ class: twMerge(CLASSES.DecrementButton.base, local.class, local.className) }}
      data-slot="number-field-decrement-button"
      data-theme={local.dataTheme}
      style={local.style}
      disabled={context?.isDisabled()}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      slot="decrement"
      onClick={handleClick}
    >
      {local.children ?? (
        <svg
          aria-hidden="true"
          data-slot="number-field-decrement-button-icon"
          fill="none"
          role="presentation"
          viewBox="0 0 16 16"
        >
          <path d="M4 7.25a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H4Z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
};

const NumberField = Object.assign(NumberFieldRoot, {
  Root: NumberFieldRoot,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  IncrementButton: NumberFieldIncrementButton,
  DecrementButton: NumberFieldDecrementButton,
});

export default NumberField;
export {
  NumberField,
  NumberFieldRoot,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementButton,
  NumberFieldDecrementButton,
};
export type { NumberFieldRootProps as NumberFieldProps };
