import {
  createMemo,
  createSignal,
  type JSX,
  mergeProps,
  Show,
  splitProps,
} from "solid-js";
import { inputVariants } from "./Input.styles";
import type { ClassProps, VariantProps } from "@src/lib/style";

export type InputVariantProps = VariantProps<typeof inputVariants>;

export type InputSharedProps = ClassProps & {
  value?: string;
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  type?: string;
  passwordReveal?: boolean;
};

export type InputProps = Partial<InputVariantProps & InputSharedProps>;

const Input = (props: InputProps) => {
  const defaultedProps = mergeProps({ type: "text" }, props);
  const [variantProps, otherProps] = splitProps(defaultedProps, [
    "class",
    ...inputVariants.variantKeys,
    "value",
    "onInput",
    "leftIcon",
    "rightIcon",
    "passwordReveal",
    "type",
  ]);

  const [showPassword, setShowPassword] = createSignal(false);

  const computedType = createMemo(() =>
    variantProps.passwordReveal && showPassword()
      ? "text"
      : (variantProps.type ?? "text")
  );

  return (
    <div class="relative flex items-center">
      <Show when={variantProps.leftIcon}>
        <span class="absolute left-3 top-1/2 -translate-y-1/2">
          {variantProps.leftIcon}
        </span>
      </Show>

      <input
        class={inputVariants(variantProps)}
        type={computedType()}
        value={variantProps.value}
        onInput={variantProps.onInput}
        aria-invalid={variantProps.color === "danger" ? "true" : undefined}
        {...otherProps}
      />

      <Show when={variantProps.passwordReveal && variantProps.rightIcon}>
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          class="absolute right-3 top-1/2 -translate-y-1/2 outline-none"
        >
          {variantProps.rightIcon}
        </button>
      </Show>
    </div>
  );
};

export default Input;
