import {
  Component,
  Show,
  createSignal,
  createMemo,
  splitProps,
  JSX,
} from "solid-js";
import Input from "../input";
import Icon from "../icon";
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

  const passwordIcon = createMemo(() => {
    if (showPassword()) {
      return (
        local.hidePasswordIcon || (
          <Icon name="icon-[mdi-light--eye-off]" width={20} height={20} />
        )
      );
    } else {
      return (
        local.showPasswordIcon || (
          <Icon name="icon-[mdi-light--eye]" width={20} height={20} />
        )
      );
    }
  });

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
