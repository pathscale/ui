import "./DateField.css";
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

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./DateField.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./DateField.recipe";

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
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
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
  isInvalid?: boolean;
  isDisabled?: boolean;
};

export type DateFieldSegmentProps = JSX.HTMLAttributes<HTMLSpanElement> &
  UIBaseProps & {
    segment?: DateFieldSegmentValue;
  };

export type DateFieldPrefixProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;
export type DateFieldSuffixProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

const DateFieldRoot: Layout<typeof componentRecipe, DateFieldRootProps> = () => {
  const [local, others] = splitProps(props, [
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

  const contextValue: DateFieldContextValue = {
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
    <DateFieldContext.Provider value={contextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          local.class,
        ) }}
        data-slot="date-field"
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
          <DateFieldGroup>
            <DateFieldInput />
          </DateFieldGroup>
        )}
      </div>
    </DateFieldContext.Provider>
  );
};

const DateFieldGroup: Layout<typeof componentRecipe, DateFieldGroupProps> = () => {
  const context = useContext(DateFieldContext);
  const [local, others] = splitProps(props, ["children", "class", "dataTheme", "style"]);

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

const DateFieldInput: Layout<typeof componentRecipe, DateFieldInputProps> = () => {
  const context = useContext(DateFieldContext);
  const [local, others] = splitProps(props, [
    "class",
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
      type="date"
      {...{ class: twMerge(CLASSES.Input.base, local.class) }}
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

const DateFieldInputContainer: Layout<typeof componentRecipe, DateFieldInputContainerProps> = () => {
  const [local, others] = splitProps(props, ["children", "class", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.InputContainer.base, local.class) }}
      data-slot="date-input-group-input-container"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DateFieldSegment: Layout<typeof componentRecipe, DateFieldSegmentProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "segment",
  ]);

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.Segment.base, local.class) }}
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

const DateFieldPrefix: Layout<typeof componentRecipe, DateFieldPrefixProps> = () => {
  const [local, others] = splitProps(props, ["children", "class", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Prefix.base, local.class) }}
      data-slot="date-input-group-prefix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DateFieldSuffix: Layout<typeof componentRecipe, DateFieldSuffixProps> = () => {
  const [local, others] = splitProps(props, ["children", "class", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Suffix.base, local.class) }}
      data-slot="date-input-group-suffix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
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
