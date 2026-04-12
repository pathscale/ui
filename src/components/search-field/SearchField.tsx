import "./SearchField.css";
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

import CloseButton, { type CloseButtonProps } from "../close-button";
import type { IComponentBaseProps } from "../types";

export type SearchFieldVariant = "primary" | "secondary";

const VARIANT_CLASS_MAP: Record<SearchFieldVariant, string> = {
  primary: "search-field--primary",
  secondary: "search-field--secondary",
};

type SearchFieldContextValue = {
  value: Accessor<string>;
  variant: Accessor<SearchFieldVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
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

export type SearchFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: SearchFieldRenderProps) => JSX.Element);
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
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

export type SearchFieldSearchIconProps = JSX.SvgSVGAttributes<SVGSVGElement> &
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
    variant,
    fullWidth,
    isDisabled,
    isInvalid,
    setValue,
    clearValue: () => setValue(""),
  };

  return (
    <SearchFieldContext.Provider value={contextValue}>
      <div
        {...others}
        class={twMerge(
          "search-field",
          VARIANT_CLASS_MAP[variant()],
          fullWidth() && "search-field--full-width",
          local.class,
          local.className,
        )}
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
            <SearchFieldSearchIcon />
            <SearchFieldInput />
            <SearchFieldClearButton />
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
      class={twMerge(
        "search-field__group",
        context?.fullWidth() && "search-field__group--full-width",
        local.class,
        local.className,
      )}
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
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style", "onInput"]);

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    invokeEventHandler(local.onInput, event);
    if (event.defaultPrevented) return;
    context?.setValue(event.currentTarget.value);
  };

  return (
    <input
      {...others}
      type="search"
      class={twMerge("search-field__input", local.class, local.className)}
      data-slot="search-field-input"
      data-theme={local.dataTheme}
      style={local.style}
      value={context?.value() ?? ""}
      disabled={context?.isDisabled()}
      aria-invalid={context?.isInvalid() ? "true" : undefined}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      onInput={handleInput}
    />
  );
};

const SearchFieldSearchIcon: Component<SearchFieldSearchIconProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  if (local.children) {
    return (
      <svg
        {...others}
        class={twMerge("search-field__search-icon", local.class, local.className)}
        data-slot="search-field-search-icon"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </svg>
    );
  }

  return (
    <svg
      {...others}
      aria-hidden="true"
      class={twMerge("search-field__search-icon", local.class, local.className)}
      data-slot="search-field-search-icon"
      data-theme={local.dataTheme}
      style={local.style}
      fill="none"
      role="presentation"
      viewBox="0 0 16 16"
    >
      <path
        d="M7.25 2.75a4.5 4.5 0 1 0 2.846 7.985l2.459 2.458a.75.75 0 1 0 1.06-1.06l-2.458-2.46A4.5 4.5 0 0 0 7.25 2.75Zm-3 4.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
        fill="currentColor"
      />
    </svg>
  );
};

const SearchFieldClearButton: Component<SearchFieldClearButtonProps> = (props) => {
  const context = useContext(SearchFieldContext);
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style", "onClick"]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    context?.clearValue();
  };

  return (
    <CloseButton
      {...others}
      class={twMerge("search-field__clear-button", local.class, local.className)}
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
