import "./TimeField.css";
import {
  createContext,
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
import { CLASSES } from "./TimeField.classes";

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
  IComponentBaseProps & {
    children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element);
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    fullWidth?: boolean;
    variant?: TimeFieldVariant;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
    required?: boolean;
  };

export type TimeFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element);
  };

export type TimeFieldInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "type"
> &
  IComponentBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type TimeFieldInputContainerProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

export type TimeFieldSegmentValue = {
  type?: string;
  text?: string;
  isPlaceholder?: boolean;
  isFocused?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
};

export type TimeFieldSegmentProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    segment?: TimeFieldSegmentValue;
  };

export type TimeFieldPrefixProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;
export type TimeFieldSuffixProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

const TimeFieldRoot: ParentComponent<TimeFieldRootProps> = (props) => {
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
    "fullWidth",
    "variant",
    "isDisabled",
    "disabled",
    "isInvalid",
    "isRequired",
    "required",
  ]);

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? "");

  const isControlled = () => local.value !== undefined;
  const value = () => (isControlled() ? local.value ?? "" : internalValue());
  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid);
  const isRequired = () => Boolean(local.isRequired) || Boolean(local.required);

  const setValue = (nextValue: string) => {
    if (!isControlled()) {
      setInternalValue(nextValue);
    }
    local.onChange?.(nextValue);
  };

  const renderProps = () => ({
    value: value(),
    isInvalid: isInvalid(),
    isDisabled: isDisabled(),
    isRequired: isRequired(),
  });

  const contextValue: TimeFieldContextValue = {
    value,
    name: () => local.name,
    variant,
    fullWidth,
    isDisabled,
    isInvalid,
    isRequired,
    onBlur: () => local.onBlur,
    setValue,
  };

  return (
    <TimeFieldContext.Provider value={contextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          local.class,
          local.className,
        ) }}
        data-slot="time-field"
        data-invalid={isInvalid() ? "true" : undefined}
        data-disabled={isDisabled() ? "true" : undefined}
        data-required={isRequired() ? "true" : undefined}
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
          <TimeFieldGroup>
            <TimeFieldInput />
          </TimeFieldGroup>
        )}
      </div>
    </TimeFieldContext.Provider>
  );
};

const TimeFieldGroup: ParentComponent<TimeFieldGroupProps> = (props) => {
  const context = useContext(TimeFieldContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

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
        local.class,
        local.className,
      ) }}
      data-slot="date-input-group"
      data-invalid={context?.isInvalid() ? "true" : undefined}
      data-disabled={context?.isDisabled() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {typeof local.children === "function" ? local.children(renderProps()) : local.children}
    </div>
  );
};

const TimeFieldInput: Component<TimeFieldInputProps> = (props) => {
  const context = useContext(TimeFieldContext);
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
    context?.setValue(event.currentTarget.value);
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onBlur, event);
    invokeEventHandler(context?.onBlur(), event);
  };

  return (
    <input
      {...others}
      type="time"
      {...{ class: twMerge(CLASSES.Input.base, local.class, local.className) }}
      data-slot="date-input-group-input"
      data-theme={local.dataTheme}
      style={local.style}
      name={local.name ?? context?.name()}
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

const TimeFieldInputContainer: ParentComponent<TimeFieldInputContainerProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.InputContainer.base, local.class, local.className) }}
      data-slot="date-input-group-input-container"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const TimeFieldSegment: ParentComponent<TimeFieldSegmentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "segment",
  ]);

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.Segment.base, local.class, local.className) }}
      data-slot="date-input-group-segment"
      data-type={local.segment?.type}
      data-placeholder={local.segment?.isPlaceholder ? "true" : undefined}
      data-invalid={local.segment?.isInvalid ? "true" : undefined}
      data-focused={local.segment?.isFocused ? "true" : undefined}
      data-disabled={local.segment?.isDisabled ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children ?? local.segment?.text}
    </span>
  );
};

const TimeFieldPrefix: ParentComponent<TimeFieldPrefixProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Prefix.base, local.class, local.className) }}
      data-slot="date-input-group-prefix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const TimeFieldSuffix: ParentComponent<TimeFieldSuffixProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Suffix.base, local.class, local.className) }}
      data-slot="date-input-group-suffix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
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
