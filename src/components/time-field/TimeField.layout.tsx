import "./TimeField.css";
import type { JSX } from "@solidjs/web";
import {createContext, createSignal, omit, useContext, type Accessor, type Component, type ParentComponent} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps, State, Issue } from "../vocabulary";
import { CLASSES } from "./TimeField.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./TimeField.recipe";
import { resolveState } from "../vocabulary";

export type TimeFieldVariant = "primary" | "secondary";

type TimeFieldContextValue = {
  value: Accessor<string>;
  name: Accessor<string | undefined>;
  variant: Accessor<TimeFieldVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isRequired: Accessor<boolean>;
  onBlur: Accessor<JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined>;
  setValue: (nextValue: string) => void;
};

const TimeFieldContext = createContext<TimeFieldContextValue>();

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type TimeFieldRenderProps = {
  value: string;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
};

export type TimeFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onBlur"> &
  UIBaseProps & {
    children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element);
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    fullWidth?: boolean;
    variant?: TimeFieldVariant;
    state?: State;
    disabled?: boolean;
    issues?: Issue[];
    required?: boolean;
  };

export type TimeFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element);
  };

export type TimeFieldInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "type"
> &
  UIBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type TimeFieldInputContainerProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

export type TimeFieldSegmentValue = {
  type?: string;
  text?: string;
  isPlaceholder?: boolean;
  isFocused?: boolean;
  issues?: Issue[];
  state?: State;
};

export type TimeFieldSegmentProps = JSX.HTMLAttributes<HTMLSpanElement> &
  UIBaseProps & {
    segment?: TimeFieldSegmentValue;
  };

export type TimeFieldPrefixProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;
export type TimeFieldSuffixProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

const TimeFieldRoot: Layout<typeof componentRecipe, TimeFieldRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "name",
    "value",
    "defaultValue",
    "onChange",
    "onBlur",
    "fullWidth",
    "variant",
    "state",
    "disabled",
    "issues",
    "required",
  );

  const [internalValue, setInternalValue] = createSignal(props.defaultValue ?? "");

  const isControlled = () => props.value !== undefined;
  const value = () => (isControlled() ? props.value ?? "" : internalValue());
  const variant = () => props.variant ?? "primary";
  const fullWidth = () => Boolean(props.fullWidth);
  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled);
  const isInvalid = () => Boolean((resolveState(props.state, props.issues) === "invalid"));
  const isRequired = () => Boolean(props.required) || Boolean(props.required);

  const setValue = (nextValue: string) => {
    if (!isControlled()) {
      setInternalValue(nextValue);
    }
    props.onChange?.(nextValue);
  };

  const renderProps = () => ({
    value: value(),
    isInvalid: isInvalid(),
    isDisabled: isDisabled(),
    isRequired: isRequired(),
  });

  const contextValue: TimeFieldContextValue = {
    value,
    name: () => props.name,
    variant,
    fullWidth,
    isDisabled,
    isInvalid,
    isRequired,
    onBlur: () => props.onBlur,
    setValue,
  };

  return (
    <TimeFieldContext value={contextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          props.class,
        ) }}
        data-slot="time-field"
        data-invalid={isInvalid() ? "true" : undefined}
        data-disabled={isDisabled() ? "true" : undefined}
        data-required={isRequired() ? "true" : undefined}
        aria-invalid={isInvalid() ? "true" : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-theme={props.dataTheme}
        style={props.style}
      >
        {typeof props.children === "function" ? (
          props.children(renderProps())
        ) : props.children ? (
          props.children
        ) : (
          <TimeFieldGroup>
            <TimeFieldInput />
          </TimeFieldGroup>
        )}
      </div>
    </TimeFieldContext>
  );
};

const TimeFieldGroup: Layout<typeof componentRecipe, TimeFieldGroupProps> = () => {
  const context = useContext(TimeFieldContext);
  const others = omit(props, "children", "class", "dataTheme", "style");

  const renderProps = () => ({
    value: context?.value() ?? "",
    isInvalid: context?.isInvalid() ?? false,
    isDisabled: context?.isDisabled() ?? false,
    isRequired: context?.isRequired() ?? false,
  });

  return (
    <div
      {...others}
      {...{ class: twMerge(
        CLASSES.Group.base,
        CLASSES.Group.variant[context?.variant() ?? "primary"],
        context?.fullWidth() && CLASSES.Group.flag.fullWidth,
        props.class,
      ) }}
      data-slot="date-input-group"
      data-invalid={context?.isInvalid() ? "true" : undefined}
      data-disabled={context?.isDisabled() ? "true" : undefined}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {typeof props.children === "function" ? props.children(renderProps()) : props.children}
    </div>
  );
};

const TimeFieldInput: Layout<typeof componentRecipe, TimeFieldInputProps> = () => {
  const context = useContext(TimeFieldContext);
  const others = omit(props, "class", "dataTheme", "style", "onInput", "onBlur", "name");

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    invokeEventHandler(props.onInput, event);
    if (event.defaultPrevented) return;
    context?.setValue(event.currentTarget.value);
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    invokeEventHandler(props.onBlur, event);
    invokeEventHandler(context?.onBlur(), event);
  };

  return (
    <input
      {...others}
      type="time"
      {...{ class: twMerge(CLASSES.Input.base, props.class) }}
      data-slot="date-input-group-input"
      data-theme={props.dataTheme}
      style={props.style}
      name={props.name ?? context?.name()}
      value={context?.value() ?? ""}
      disabled={context?.isDisabled()}
      required={context?.isRequired()}
      aria-invalid={context?.isInvalid() ? "true" : undefined}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      onInput={handleInput}
      onBlur={handleBlur}
    />
  );
};

const TimeFieldInputContainer: Layout<typeof componentRecipe, TimeFieldInputContainerProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.InputContainer.base, props.class) }}
      data-slot="date-input-group-input-container"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const TimeFieldSegment: Layout<typeof componentRecipe, TimeFieldSegmentProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "segment");

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.Segment.base, props.class) }}
      data-slot="date-input-group-segment"
      data-type={props.segment?.type}
      data-placeholder={props.segment?.isPlaceholder ? "true" : undefined}
      data-invalid={props.segment?.issues?.length ? "true" : undefined}
      data-focused={props.segment?.isFocused ? "true" : undefined}
      data-disabled={props.segment?.state === "disabled" ? "true" : undefined}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children ?? props.segment?.text}
    </span>
  );
};

const TimeFieldPrefix: Layout<typeof componentRecipe, TimeFieldPrefixProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Prefix.base, props.class) }}
      data-slot="date-input-group-prefix"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const TimeFieldSuffix: Layout<typeof componentRecipe, TimeFieldSuffixProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Suffix.base, props.class) }}
      data-slot="date-input-group-suffix"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const TimeField = Object.assign(TimeFieldRoot, {
  Root: TimeFieldRoot,
  Group: TimeFieldGroup,
  Input: TimeFieldInput,
  InputContainer: TimeFieldInputContainer,
  Segment: TimeFieldSegment,
  Prefix: TimeFieldPrefix,
  Suffix: TimeFieldSuffix,
});

export default TimeField;
export {
  TimeField,
  TimeFieldRoot,
  TimeFieldGroup,
  TimeFieldInput,
  TimeFieldInputContainer,
  TimeFieldSegment,
  TimeFieldPrefix,
  TimeFieldSuffix,
};
export type { TimeFieldRootProps as TimeFieldProps };
