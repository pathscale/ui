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

import type { IComponentBaseProps } from "../types";

export type DateFieldVariant = "primary" | "secondary";

const VARIANT_CLASS_MAP: Record<DateFieldVariant, string> = {
  primary: "date-field--primary",
  secondary: "date-field--secondary",
};

const GROUP_VARIANT_CLASS_MAP: Record<DateFieldVariant, string> = {
  primary: "date-input-group--primary",
  secondary: "date-input-group--secondary",
};

type DateFieldContextValue = {
  value: Accessor<string>;
  variant: Accessor<DateFieldVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isRequired: Accessor<boolean>;
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

export type DateFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element);
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    fullWidth?: boolean;
    variant?: DateFieldVariant;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
    required?: boolean;
  };

export type DateFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element);
  };

export type DateFieldInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "type"
> &
  IComponentBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type DateFieldInputContainerProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

export type DateFieldSegmentValue = {
  type?: string;
  text?: string;
  isPlaceholder?: boolean;
  isFocused?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
};

export type DateFieldSegmentProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    segment?: DateFieldSegmentValue;
  };

export type DateFieldPrefixProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;
export type DateFieldSuffixProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

const DateFieldRoot: ParentComponent<DateFieldRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "value",
    "defaultValue",
    "onChange",
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
    variant,
    fullWidth,
    isDisabled,
    isInvalid,
    isRequired,
    setValue,
  };

  return (
    <DateFieldContext.Provider value={contextValue}>
      <div
        {...others}
        class={twMerge(
          "date-field",
          VARIANT_CLASS_MAP[variant()],
          fullWidth() && "date-field--full-width",
          local.class,
          local.className,
        )}
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

const DateFieldGroup: ParentComponent<DateFieldGroupProps> = (props) => {
  const context = useContext(DateFieldContext);
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
      class={twMerge(
        "date-input-group",
        GROUP_VARIANT_CLASS_MAP[context?.variant() ?? "primary"],
        context?.fullWidth() && "date-input-group--full-width",
        local.class,
        local.className,
      )}
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

const DateFieldInput: Component<DateFieldInputProps> = (props) => {
  const context = useContext(DateFieldContext);
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style", "onInput"]);

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    invokeEventHandler(local.onInput, event);
    if (event.defaultPrevented) return;
    context?.setValue(event.currentTarget.value);
  };

  return (
    <input
      {...others}
      type="date"
      class={twMerge("date-input-group__input", local.class, local.className)}
      data-slot="date-input-group-input"
      data-theme={local.dataTheme}
      style={local.style}
      value={context?.value() ?? ""}
      disabled={context?.isDisabled()}
      required={context?.isRequired()}
      aria-invalid={context?.isInvalid() ? "true" : undefined}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      onInput={handleInput}
    />
  );
};

const DateFieldInputContainer: ParentComponent<DateFieldInputContainerProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("date-input-group__input-container", local.class, local.className)}
      data-slot="date-input-group-input-container"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DateFieldSegment: ParentComponent<DateFieldSegmentProps> = (props) => {
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
      class={twMerge("date-input-group__segment", local.class, local.className)}
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

const DateFieldPrefix: ParentComponent<DateFieldPrefixProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("date-input-group__prefix", local.class, local.className)}
      data-slot="date-input-group-prefix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DateFieldSuffix: ParentComponent<DateFieldSuffixProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("date-input-group__suffix", local.class, local.className)}
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
