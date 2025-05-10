import {
  type ComponentProps,
  createMemo,
  createSignal,
  type JSX,
  mergeProps,
  Show,
  splitProps,
} from "solid-js";
import { inputVariants } from "./Input.styles";
import type { ClassProps, VariantProps } from "@src/lib/style";

export type InputProps = Partial<
  VariantProps<typeof inputVariants> & ClassProps & ComponentProps<"input">
> & {
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  passwordReveal?: boolean;
};

const Input = (props: InputProps) => {
  const defaultedProps = mergeProps({ type: "text" }, props);

  const [localProps, variantProps, otherProps] = splitProps(
    defaultedProps,
    ["type", "passwordReveal", "leftIcon", "rightIcon"],
    ["class", ...inputVariants.variantKeys]
  );

  const [showPassword, setShowPassword] = createSignal(false);

  const computedType = createMemo(() =>
    localProps.passwordReveal && showPassword() ? "text" : defaultedProps.type
  );

  return (
    <div class="relative flex items-center">
      <Show when={localProps.leftIcon}>
        <span class="absolute left-3 top-1/2 -translate-y-1/2">
          {localProps.leftIcon}
        </span>
      </Show>

      <input
        class={inputVariants(variantProps)}
        type={computedType()}
        aria-invalid={variantProps.color === "danger" ? "true" : undefined}
        {...otherProps}
      />

      <Show when={localProps.passwordReveal && localProps.rightIcon}>
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          class="absolute right-3 top-1/2 -translate-y-1/2 outline-none"
        >
          {localProps.rightIcon}
        </button>
      </Show>
    </div>
  );
};

export default Input;
