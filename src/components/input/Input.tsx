import "./Input.css";
import {
  Show,
  createContext,
  createUniqueId,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { CLASSES } from "./Input.classes";
type InputSize = "sm" | "md" | "lg";

type InputContextValue = {
  fieldId: Accessor<string>;
  helperId: Accessor<string>;
  size: Accessor<InputSize>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  fullWidth: Accessor<boolean>;
};

const InputContext = createContext<InputContextValue>();

type InputRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: JSX.Element;
  size?: InputSize;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  dataTheme?: string;
  className?: string;
};

const InputRoot: Component<InputRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "size",
    "fullWidth",
    "isDisabled",
    "isInvalid",
    "dataTheme",
  ]);

  const baseId = createUniqueId();

  const size = () => local.size ?? "md";
  const isDisabled = () => Boolean(local.isDisabled);
  const isInvalid = () => Boolean(local.isInvalid);
  const fullWidth = () => Boolean(local.fullWidth);

  return (
    <InputContext.Provider
      value={{
        fieldId: () => `${baseId}-field`,
        helperId: () => `${baseId}-helper`,
        size,
        isDisabled,
        isInvalid,
        fullWidth,
      }}
    >
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.base,
          fullWidth() && CLASSES.flag.fullWidthRoot,
          local.class,
          local.className,
        ) }}
        data-theme={local.dataTheme}
        data-slot="input-root"
      >
        {local.children}
      </div>
    </InputContext.Provider>
  );
};

type InputFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size" | "children" | "disabled"> & {
  size?: InputSize;
  isDisabled?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  dataTheme?: string;
  className?: string;
};

const InputField: Component<InputFieldProps> = (props) => {
  const ctx = useContext(InputContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "size",
    "isDisabled",
    "disabled",
    "isInvalid",
    "fullWidth",
    "startIcon",
    "endIcon",
    "dataTheme",
    "id",
    "aria-invalid",
  ]);

  const size = () => local.size ?? ctx?.size() ?? "md";
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled) || Boolean(ctx?.isDisabled());
  const isInvalid = () =>
    Boolean(local.isInvalid) || Boolean(local["aria-invalid"]) || Boolean(ctx?.isInvalid());
  const fullWidth = () => Boolean(local.fullWidth) || Boolean(ctx?.fullWidth());
  const inputId = () => local.id ?? ctx?.fieldId();
  const ariaInvalid = () => local["aria-invalid"] ?? (isInvalid() ? true : undefined);

  const controlClasses = () =>
    twMerge(
      CLASSES.slot.control,
      CLASSES.size[size()],
      fullWidth() && CLASSES.flag.fullWidthControl,
      isDisabled() && CLASSES.flag.disabled,
      isInvalid() && CLASSES.flag.invalid,
      local.class,
      local.className,
    );

  return (
    <div
      {...{ class: controlClasses() }}
      data-theme={local.dataTheme}
      data-slot="input-control"
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
    >
      <Show when={local.startIcon}>
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }}
          data-slot="input-start-icon"
        >
          {local.startIcon}
        </span>
      </Show>
      <input
        {...others}
        id={inputId()}
        {...{ class: CLASSES.slot.field }}
        disabled={isDisabled()}
        aria-disabled={isDisabled() ? "true" : "false"}
        aria-invalid={ariaInvalid()}
        data-slot="input-field"
      />
      <Show when={local.endIcon}>
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }}
          data-slot="input-end-icon"
        >
          {local.endIcon}
        </span>
      </Show>
    </div>
  );
};

type InputLabelProps = JSX.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

const InputLabel: Component<InputLabelProps> = (props) => {
  const ctx = useContext(InputContext);
  const [local, others] = splitProps(props, ["class", "className", "for", "children"]);

  return (
    <label
      {...others}
      for={local.for ?? ctx?.fieldId()}
      {...{ class: twMerge(CLASSES.slot.label, local.class, local.className) }}
      data-slot="input-label"
    >
      {local.children}
    </label>
  );
};

type InputHelperProps = JSX.HTMLAttributes<HTMLParagraphElement> & {
  invalid?: boolean;
  className?: string;
};

const InputHelper: Component<InputHelperProps> = (props) => {
  const ctx = useContext(InputContext);
  const [local, others] = splitProps(props, ["class", "className", "invalid", "id", "children"]);

  const invalid = () => Boolean(local.invalid) || Boolean(ctx?.isInvalid());

  return (
    <p
      {...others}
      id={local.id ?? ctx?.helperId()}
      {...{ class: twMerge(
        CLASSES.slot.helper,
        invalid() && CLASSES.flag.helperInvalid,
        local.class,
        local.className,
      ) }}
      data-slot="input-helper"
    >
      {local.children}
    </p>
  );
};

type InputProps = Omit<InputFieldProps, "id" | "aria-describedby"> & {
  id?: string;
  label?: JSX.Element;
  helperText?: JSX.Element;
  errorMessage?: JSX.Element;
};

const InputBase: Component<InputProps> = (props) => {
  const generatedId = createUniqueId();
  const [local, fieldProps] = splitProps(props, [
    "id",
    "size",
    "fullWidth",
    "isDisabled",
    "disabled",
    "isInvalid",
    "label",
    "helperText",
    "errorMessage",
    "class",
    "className",
    "aria-invalid",
    "dataTheme",
  ]);

  const inputId = () => local.id ?? `${generatedId}-input`;
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () =>
    Boolean(local.isInvalid) || Boolean(local["aria-invalid"]) || local.errorMessage != null;

  const helperContent = () => local.errorMessage ?? local.helperText;
  const hasHelper = () => helperContent() != null;
  const helperId = () => `${inputId()}-helper`;

  return (
    <InputRoot
      size={local.size}
      fullWidth={local.fullWidth ?? true}
      isDisabled={isDisabled()}
      isInvalid={isInvalid()}
      dataTheme={local.dataTheme}
    >
      <>
        <Show when={local.label}>
          <InputLabel>{local.label}</InputLabel>
        </Show>
        <InputField
          {...fieldProps}
          id={inputId()}
          size={local.size}
          isDisabled={isDisabled()}
          isInvalid={isInvalid()}
          aria-describedby={hasHelper() ? helperId() : undefined}
          {...{ class: local.class }}
          className={local.className}
          dataTheme={local.dataTheme}
        />
        <Show when={hasHelper()}>
          <InputHelper id={helperId()} invalid={isInvalid()}>
            {helperContent()}
          </InputHelper>
        </Show>
      </>
    </InputRoot>
  );
};

type InputComponent = Component<InputProps> & {
  Root: Component<InputRootProps>;
  Field: Component<InputFieldProps>;
  Label: Component<InputLabelProps>;
  Helper: Component<InputHelperProps>;
};

const Input = Object.assign(InputBase, {
  Root: InputRoot,
  Field: InputField,
  Label: InputLabel,
  Helper: InputHelper,
}) as InputComponent;

export default Input;
export type {
  InputProps,
  InputSize,
  InputRootProps,
  InputFieldProps,
  InputLabelProps,
  InputHelperProps,
};
