import "./Input.css";
import type { JSX } from "@solidjs/web";
import {Show, createContext, createUniqueId, omit, useContext, type Accessor, type Component} from "solid-js";
import { twMerge } from "../../lib/twMerge";
import { CLASSES } from "./Input.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Input.recipe";
import type { State, Issue } from "../vocabulary";
import { resolveState } from "../vocabulary";
type InputSize = "sm" | "md" | "lg";

type InputContextValue = {
  fieldId: Accessor<string>;
  helperId: Accessor<string>;
  size: Accessor<InputSize>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  fullWidth: Accessor<boolean>;
};

/*
 * Defaulted to `null` rather than left undefined.
 *
 * Every consumer below reads it as `ctx?.…`, so a field used on its own,
 * without an `<Input>` root, has always been supported. Solid 2 made that
 * throw: `getContext` raises `ContextNotFoundError` when the resolved value
 * is `undefined`, which happens before the optional chain can run. `null` is
 * a value, so the lookup succeeds and the existing optional reads behave as
 * they always have.
 *
 * `{}` would also silence the throw and is wrong: it is truthy, so `ctx?.size()`
 * would be called on an object with no such method.
 */
const InputContext = createContext<InputContextValue | null>(null);

type InputRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: JSX.Element;
  size?: InputSize;
  fullWidth?: boolean;
  state?: State;
  issues?: Issue[];
  dataTheme?: string;
};

const InputRoot: Layout<typeof componentRecipe, InputRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "size",
    "fullWidth",
    "state",
    "issues",
    "dataTheme",
  );

  const baseId = createUniqueId();

  const size = () => props.size ?? "md";
  const isDisabled = () => Boolean((props.state === "disabled"));
  const isInvalid = () => Boolean((resolveState(props.state, props.issues) === "invalid"));
  const fullWidth = () => Boolean(props.fullWidth);

  return (
    <InputContext
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
          props.class,
        ) }}
        data-theme={props.dataTheme}
        data-slot="input-root"
      >
        {props.children}
      </div>
    </InputContext>
  );
};

type InputFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size" | "children" | "disabled"> & {
  size?: InputSize;
  state?: State;
  disabled?: boolean;
  issues?: Issue[];
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  dataTheme?: string;
};

const InputField: Layout<typeof componentRecipe, InputFieldProps> = () => {
  const ctx = useContext(InputContext);
  const others = omit(
    props,
    "class",
    "size",
    "state",
    "disabled",
    "issues",
    "fullWidth",
    "startIcon",
    "endIcon",
    "dataTheme",
    "id",
    "aria-invalid",
  );

  const size = () => props.size ?? ctx?.size() ?? "md";
  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled) || Boolean(ctx?.isDisabled());
  const isInvalid = () =>
    Boolean((resolveState(props.state, props.issues) === "invalid")) || Boolean(local["aria-invalid"]) || Boolean(ctx?.isInvalid());
  const fullWidth = () => Boolean(props.fullWidth) || Boolean(ctx?.fullWidth());
  const inputId = () => props.id ?? ctx?.fieldId();
  const ariaInvalid = () => local["aria-invalid"] ?? (isInvalid() ? true : undefined);

  const controlClasses = () =>
    twMerge(
      CLASSES.slot.control,
      CLASSES.size[size()],
      fullWidth() && CLASSES.flag.fullWidthControl,
      isDisabled() && CLASSES.flag.disabled,
      isInvalid() && CLASSES.flag.invalid,
      props.class,
    );

  return (
    <div
      {...{ class: controlClasses() }}
      data-theme={props.dataTheme}
      data-slot="input-control"
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
    >
      <Show when={props.startIcon}>
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }}
          data-slot="input-start-icon"
        >
          {props.startIcon}
        </span>
      </Show>
      <input
        {...others}
        id={inputId()}
        {...{ class: CLASSES.slot.field }}
        disabled={isDisabled()}
        aria-disabled={isDisabled() ? "true" : "false"}
        aria-invalid={ariaInvalid() ? "true" : "false"}
        data-slot="input-field"
      />
      <Show when={props.endIcon}>
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }}
          data-slot="input-end-icon"
        >
          {props.endIcon}
        </span>
      </Show>
    </div>
  );
};

type InputLabelProps = JSX.LabelHTMLAttributes<HTMLLabelElement> & {
};

const InputLabel: Layout<typeof componentRecipe, InputLabelProps> = () => {
  const ctx = useContext(InputContext);
  const others = omit(props, "class", "for", "children");

  return (
    <label
      {...others}
      for={props.for ?? ctx?.fieldId()}
      {...{ class: twMerge(CLASSES.slot.label, props.class) }}
      data-slot="input-label"
    >
      {props.children}
    </label>
  );
};

type InputHelperProps = JSX.HTMLAttributes<HTMLParagraphElement> & {
  invalid?: boolean;
};

const InputHelper: Layout<typeof componentRecipe, InputHelperProps> = () => {
  const ctx = useContext(InputContext);
  const others = omit(props, "class", "invalid", "id", "children");

  const invalid = () => Boolean(props.invalid) || Boolean(ctx?.isInvalid());

  return (
    <p
      {...others}
      id={props.id ?? ctx?.helperId()}
      {...{ class: twMerge(
        CLASSES.slot.helper,
        invalid() && CLASSES.flag.helperInvalid,
        props.class,
      ) }}
      data-slot="input-helper"
    >
      {props.children}
    </p>
  );
};

type InputProps = Omit<InputFieldProps, "id" | "aria-describedby"> & {
  id?: string;
  label?: JSX.Element;
  helperText?: JSX.Element;
  errorMessage?: JSX.Element;
};

const InputBase: Layout<typeof componentRecipe, InputProps> = () => {
  const generatedId = createUniqueId();
  const fieldProps = omit(
    props,
    "id",
    "size",
    "fullWidth",
    "state",
    "disabled",
    "issues",
    "label",
    "helperText",
    "errorMessage",
    "class",
    "aria-invalid",
    "dataTheme",
  );

  const inputId = () => props.id ?? `${generatedId}-input`;
  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled);
  const isInvalid = () =>
    Boolean((resolveState(props.state, props.issues) === "invalid")) || Boolean(local["aria-invalid"]) || props.errorMessage != null;

  const helperContent = () => props.errorMessage ?? props.helperText;
  const hasHelper = () => helperContent() != null;
  const helperId = () => `${inputId()}-helper`;

  return (
    <InputRoot
      size={props.size}
      fullWidth={props.fullWidth ?? true}
      state={isDisabled() ? "disabled" : undefined}
      issues={props.issues}
      dataTheme={props.dataTheme}
    >
      <>
        <Show when={props.label}>
          <InputLabel>{props.label}</InputLabel>
        </Show>
        <InputField
          {...fieldProps}
          id={inputId()}
          size={props.size}
          state={isDisabled() ? "disabled" : undefined}
          issues={props.issues}
          aria-describedby={hasHelper() ? helperId() : undefined}
          {...{ class: props.class }}
          dataTheme={props.dataTheme}
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
