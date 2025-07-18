import {
  Component,
  Show,
  createSignal,
  createMemo,
  splitProps,
  JSX,
} from "solid-js";
import Input from "../input";
import type { InputProps } from "../input";
import { useFormValidation } from "./ValidatedForm";
import { twMerge } from "tailwind-merge";
import Form from "./Form";

export interface PasswordFieldProps extends Omit<InputProps, "type" | "ref"> {
  label?: string;
  name: string;
  required?: boolean;
  labelClass?: string;
  errorClass?: string;
  containerClass?: string;
  description?: string;
  descriptionClass?: string;
  showPasswordIcon?: JSX.Element;
  hidePasswordIcon?: JSX.Element;
}

export const PasswordField: Component<PasswordFieldProps> = (props) => {
  const [showPassword, setShowPassword] = createSignal(false);
  const { errors, touched } = useFormValidation();

  const [local, inputProps] = splitProps(props, [
    "label",
    "required",
    "labelClass",
    "errorClass",
    "containerClass",
    "description",
    "descriptionClass",
    "showPasswordIcon",
    "hidePasswordIcon",
    "class",
    "className",
  ]);

  const togglePassword = () => setShowPassword(!showPassword());

  const containerClasses = createMemo(() =>
    twMerge("flex flex-col gap-2", local.containerClass)
  );

  const descriptionClasses = createMemo(() =>
    twMerge("text-sm text-base-content/70", local.descriptionClass)
  );

  const errorClasses = createMemo(() =>
    twMerge("text-error text-sm", local.errorClass)
  );

  const inputClasses = createMemo(() => twMerge(local.class, local.className));

  const hasError = createMemo(
    () => touched(props.name) && !!errors(props.name)
  );

  // Default icons if not provided
  const defaultShowIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-5 h-5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );

  const defaultHideIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-5 h-5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );

  const passwordIcon = createMemo(() =>
    showPassword()
      ? local.hidePasswordIcon || defaultHideIcon
      : local.showPasswordIcon || defaultShowIcon
  );

  return (
    <div class={containerClasses()}>
      {local.label && (
        <Form.Label title={local.label} class={local.labelClass}>
          {local.required && <span class="text-error ml-1">*</span>}
        </Form.Label>
      )}

      {local.description && (
        <p class={descriptionClasses()}>{local.description}</p>
      )}

      <Input
        id={props.name}
        type={showPassword() ? "text" : "password"}
        aria-invalid={hasError()}
        aria-required={local.required}
        class={inputClasses()}
        rightIcon={
          <span
            class="cursor-pointer"
            onClick={togglePassword}
            role="button"
            aria-label={showPassword() ? "Hide password" : "Show password"}
          >
            {passwordIcon()}
          </span>
        }
        {...inputProps}
      />

      <Show when={hasError()}>
        <p class={errorClasses()}>{errors(props.name)}</p>
      </Show>
    </div>
  );
};

export default PasswordField;
