import "./InputGroup.css";
import { createContext, splitProps, useContext, type Accessor, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import { useTextFieldContext, type TextFieldVariant } from "../text-field";
import type { IComponentBaseProps } from "../types";

export type InputGroupVariant = TextFieldVariant;

const VARIANT_CLASS_MAP: Record<InputGroupVariant, string> = {
  primary: "input-group--primary",
  secondary: "input-group--secondary",
};

type InputGroupContextValue = {
  variant: Accessor<InputGroupVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
};

const InputGroupContext = createContext<InputGroupContextValue>();

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type InputGroupRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    variant?: InputGroupVariant;
    fullWidth?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
  };

export type InputGroupInputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "disabled"> &
  IComponentBaseProps & {
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
  };

export type InputGroupTextAreaProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "disabled"> &
  IComponentBaseProps & {
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
  };

export type InputGroupPrefixProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type InputGroupSuffixProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const InputGroupRoot: ParentComponent<InputGroupRootProps> = (props) => {
  const textFieldContext = useTextFieldContext();

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "fullWidth",
    "isDisabled",
    "disabled",
    "isInvalid",
    "onClick",
    "ref",
    "aria-invalid",
  ]);

  let groupRef: HTMLDivElement | undefined;

  const variant = () => local.variant ?? textFieldContext?.variant?.() ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth) || Boolean(textFieldContext?.fullWidth?.());
  const isDisabled = () =>
    Boolean(local.isDisabled) || Boolean(local.disabled) || Boolean(textFieldContext?.isDisabled?.());
  const isInvalid = () =>
    Boolean(local.isInvalid) ||
    Boolean(textFieldContext?.isInvalid?.()) ||
    Boolean(local["aria-invalid"]) ||
    local["aria-invalid"] === "true";

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (!isDisabled()) {
      const target = event.target as HTMLElement;
      const input = groupRef?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        '[data-slot="input-group-input"], [data-slot="input-group-textarea"]',
      );

      if (input && target !== input && !input.contains(target)) {
        input.focus();
      }
    }

    invokeEventHandler(local.onClick, event);
  };

  return (
    <InputGroupContext.Provider value={{ variant, fullWidth, isDisabled, isInvalid }}>
      <div
        {...others}
        ref={(node) => {
          groupRef = node;
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        class={twMerge(
          "input-group",
          VARIANT_CLASS_MAP[variant()],
          fullWidth() && "input-group--full-width",
          local.class,
          local.className,
        )}
        data-slot="input-group"
        data-disabled={isDisabled() ? "true" : undefined}
        data-invalid={isInvalid() ? "true" : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        aria-invalid={isInvalid() ? "true" : undefined}
        data-theme={local.dataTheme}
        style={local.style}
        onClick={handleClick}
      >
        {local.children}
      </div>
    </InputGroupContext.Provider>
  );
};

const InputGroupInput: Component<InputGroupInputProps> = (props) => {
  const context = useContext(InputGroupContext);

  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "isDisabled",
    "disabled",
    "isInvalid",
  ]);

  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled) || Boolean(context?.isDisabled());
  const isInvalid = () => Boolean(local.isInvalid) || Boolean(context?.isInvalid());

  return (
    <input
      {...others}
      class={twMerge("input-group__input", local.class, local.className)}
      data-slot="input-group-input"
      data-theme={local.dataTheme}
      style={local.style}
      disabled={isDisabled()}
      aria-disabled={isDisabled() ? "true" : undefined}
      aria-invalid={isInvalid() ? "true" : undefined}
    />
  );
};

const InputGroupTextArea: Component<InputGroupTextAreaProps> = (props) => {
  const context = useContext(InputGroupContext);

  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "isDisabled",
    "disabled",
    "isInvalid",
  ]);

  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled) || Boolean(context?.isDisabled());
  const isInvalid = () => Boolean(local.isInvalid) || Boolean(context?.isInvalid());

  return (
    <textarea
      {...others}
      class={twMerge("input-group__input", local.class, local.className)}
      data-slot="input-group-textarea"
      data-theme={local.dataTheme}
      style={local.style}
      disabled={isDisabled()}
      aria-disabled={isDisabled() ? "true" : undefined}
      aria-invalid={isInvalid() ? "true" : undefined}
    />
  );
};

const InputGroupPrefix: ParentComponent<InputGroupPrefixProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("input-group__prefix", local.class, local.className)}
      data-slot="input-group-prefix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const InputGroupSuffix: ParentComponent<InputGroupSuffixProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("input-group__suffix", local.class, local.className)}
      data-slot="input-group-suffix"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const InputGroup = Object.assign(InputGroupRoot, {
  Root: InputGroupRoot,
  Input: InputGroupInput,
  TextArea: InputGroupTextArea,
  Prefix: InputGroupPrefix,
  Suffix: InputGroupSuffix,
});

export default InputGroup;
export {
  InputGroup,
  InputGroupRoot,
  InputGroupInput,
  InputGroupTextArea,
  InputGroupPrefix,
  InputGroupSuffix,
};
export type { InputGroupRootProps as InputGroupProps };
