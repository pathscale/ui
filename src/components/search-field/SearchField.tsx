import "./SearchField.css";
import {
  createContext,
  createSignal,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import CloseButton, { type CloseButtonProps } from "../close-button";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./SearchField.classes";

export type SearchFieldVariant = "primary" | "secondary";

type SearchFieldContextValue = {
  value: Accessor<string>;
  name: Accessor<string | undefined>;
  variant: Accessor<SearchFieldVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  onBlur: Accessor<JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined>;
  setValue: (nextValue: string) => void;
  clearValue: () => void;
};

const SearchFieldContext = createContext<SearchFieldContextValue>();

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type SearchFieldRenderProps = {
  value: string;
  isEmpty: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
};

export type SearchFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onBlur"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: SearchFieldRenderProps) => JSX.Element);
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    fullWidth?: boolean;
    variant?: SearchFieldVariant;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
  };

export type SearchFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: SearchFieldRenderProps) => JSX.Element);
  };

export type SearchFieldInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "type"
> &
  IComponentBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type SearchFieldSearchIconProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type SearchFieldClearButtonProps = Omit<CloseButtonProps, "onClick"> &
  IComponentBaseProps & {
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  };

const SearchFieldRoot: ParentComponent<SearchFieldRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "startIcon",
    "endIcon",
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
  ]);

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? "");

  const isControlled = () => local.value !== undefined;
  const value = () => (isControlled() ? local.value ?? "" : internalValue());
  const isEmpty = () => value().length === 0;
  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid);

  const setValue = (nextValue: string) => {
    if (!isControlled()) {
      setInternalValue(nextValue);
    }
    local.onChange?.(nextValue);
  };

  const renderProps = () => ({
    value: value(),
    isEmpty: isEmpty(),
    isInvalid: isInvalid(),
    isDisabled: isDisabled(),
  });

  const contextValue: SearchFieldContextValue = {
    value,
    name: () => local.name,
    variant,
    fullWidth,
    isDisabled,
    isInvalid,
    onBlur: () => local.onBlur,
    setValue,
    clearValue: () => setValue(""),
  };

  return (
    <SearchFieldContext.Provider value={contextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          local.class,
          local.className,
        ) }}
        data-slot="search-field"
        data-empty={isEmpty() ? "true" : "false"}
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
          <SearchFieldGroup>
            <Show when={local.startIcon}>
              <SearchFieldSearchIcon>{local.startIcon}</SearchFieldSearchIcon>
            </Show>
            <SearchFieldInput />
            <Show when={local.endIcon}>
              <SearchFieldClearButton>{local.endIcon}</SearchFieldClearButton>
            </Show>
          </SearchFieldGroup>
        )}
      </div>
    </SearchFieldContext.Provider>
  );
};

const SearchFieldGroup: ParentComponent<SearchFieldGroupProps> = (props) => {
  const context = useContext(SearchFieldContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  const renderProps = () => ({
    value: context?.value() ?? "",
    isEmpty: (context?.value() ?? "").length === 0,
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
      data-slot="search-field-group"
      data-invalid={context?.isInvalid() ? "true" : undefined}
      data-disabled={context?.isDisabled() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {typeof local.children === "function" ? local.children(renderProps()) : local.children}
    </div>
  );
};

const SearchFieldInput: Component<SearchFieldInputProps> = (props) => {
  const context = useContext(SearchFieldContext);
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
      type="search"
      {...{ class: twMerge(CLASSES.Input.base, local.class, local.className) }}
      data-slot="search-field-input"
      data-theme={local.dataTheme}
      style={local.style}
      name={local.name ?? context?.name()}
      value={context?.value() ?? ""}
      disabled={context?.isDisabled()}
      aria-invalid={context?.isInvalid() ? "true" : undefined}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      onInput={handleInput}
      onBlur={handleBlur}
    />
  );
};

const SearchFieldSearchIcon: Component<SearchFieldSearchIconProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  if (!local.children) return null;

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.SearchIcon.base, local.class, local.className) }}
      data-slot="search-field-search-icon"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </span>
  );
};

const SearchFieldClearButton: Component<SearchFieldClearButtonProps> = (props) => {
  const context = useContext(SearchFieldContext);
  const hasIcon = () => props.children != null || props.startIcon != null || props.endIcon != null;
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style", "onClick"]);

  if (!hasIcon()) return null;

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    context?.clearValue();
  };

  return (
    <CloseButton
      {...others}
      {...{ class: twMerge(CLASSES.ClearButton.base, local.class, local.className) }}
      data-slot="search-field-clear-button"
      data-theme={local.dataTheme}
      style={local.style}
      slot="clear"
      aria-label={props["aria-label"] ?? "Clear search"}
      isDisabled={context?.isDisabled()}
      onClick={handleClick}
    />
  );
};

const SearchField = Object.assign(SearchFieldRoot, {
  Root: SearchFieldRoot,
  Group: SearchFieldGroup,
  Input: SearchFieldInput,
  SearchIcon: SearchFieldSearchIcon,
  ClearButton: SearchFieldClearButton,
});

export default SearchField;
export {
  SearchField,
  SearchFieldRoot,
  SearchFieldGroup,
  SearchFieldInput,
  SearchFieldSearchIcon,
  SearchFieldClearButton,
};
export type { SearchFieldRootProps as SearchFieldProps };
