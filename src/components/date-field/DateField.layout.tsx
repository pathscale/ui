import "./DateField.css";
import type { JSX } from "@solidjs/web";
import {createContext, createSignal, omit, useContext, type Accessor, type Component, type ParentComponent} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps, State, Issue } from "../vocabulary";
import { CLASSES } from "./DateField.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./DateField.recipe";
import { resolveState } from "../vocabulary";

export type DateFieldVariant = "primary" | "secondary";

type DateFieldContextValue = {
  value: Accessor<string>;
  name: Accessor<string | undefined>;
  variant: Accessor<DateFieldVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isRequired: Accessor<boolean>;
  onBlur: Accessor<JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined>;
  setValue: (nextValue: string) => void;
};

const DateFieldContext = createContext<DateFieldContextValue>();

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type DateFieldRenderProps = {
  value: string;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
};

export type DateFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onBlur"> &
  UIBaseProps & {
    children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element);
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    fullWidth?: boolean;
    variant?: DateFieldVariant;
    state?: State;
    disabled?: boolean;
    issues?: Issue[];
    required?: boolean;
  };

export type DateFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element);
  };

export type DateFieldInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "type"
> &
  UIBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type DateFieldInputContainerProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

export type DateFieldSegmentValue = {
  type?: string;
  text?: string;
  isPlaceholder?: boolean;
  isFocused?: boolean;
  issues?: Issue[];
  state?: State;
};

export type DateFieldSegmentProps = JSX.HTMLAttributes<HTMLSpanElement> &
  UIBaseProps & {
    segment?: DateFieldSegmentValue;
  };

export type DateFieldPrefixProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;
export type DateFieldSuffixProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

const DateFieldRoot: Layout<typeof componentRecipe, DateFieldRootProps> = () => {
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

  const contextValue: DateFieldContextValue = {
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
    <DateFieldContext value={contextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          props.class,
        ) }}
        data-slot="date-field"
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
          <DateFieldGroup>
            <DateFieldInput />
          </DateFieldGroup>
        )}
      </div>
    </DateFieldContext>
  );
};

const DateFieldGroup: Layout<typeof componentRecipe, DateFieldGroupProps> = () => {
  const context = useContext(DateFieldContext);
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

const DateFieldInput: Layout<typeof componentRecipe, DateFieldInputProps> = () => {
  const context = useContext(DateFieldContext);
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
      type="date"
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

const DateFieldInputContainer: Layout<typeof componentRecipe, DateFieldInputContainerProps> = () => {
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

const DateFieldSegment: Layout<typeof componentRecipe, DateFieldSegmentProps> = () => {
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

const DateFieldPrefix: Layout<typeof componentRecipe, DateFieldPrefixProps> = () => {
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

const DateFieldSuffix: Layout<typeof componentRecipe, DateFieldSuffixProps> = () => {
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

const DateField = Object.assign(DateFieldRoot, {
  Root: DateFieldRoot,
  Group: DateFieldGroup,
  Input: DateFieldInput,
  InputContainer: DateFieldInputContainer,
  Segment: DateFieldSegment,
  Prefix: DateFieldPrefix,
  Suffix: DateFieldSuffix,
});

export default DateField;
export {
  DateField,
  DateFieldRoot,
  DateFieldGroup,
  DateFieldInput,
  DateFieldInputContainer,
  DateFieldSegment,
  DateFieldPrefix,
  DateFieldSuffix,
};
export type { DateFieldRootProps as DateFieldProps };
