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

  const [variantProps, variantRest] = splitProps(defaultedProps, [
    "class",
    ...inputVariants.variantKeys,
  ]);

  const [localProps, otherProps] = splitProps(variantRest, [
    "type",
    "passwordReveal",
    "value",
    "onInput",
    "leftIcon",
    "rightIcon",
  ]);

  const [showPassword, setShowPassword] = createSignal(false);

  const computedType = createMemo(() =>
    localProps.passwordReveal && showPassword()
      ? "text"
      : (localProps.type ?? "text")
  );

  localProps.type = computedType();

  return (
    <div class="relative flex items-center">
      <Show when={localProps.leftIcon}>
        <span class="absolute left-3 top-1/2 -translate-y-1/2">
          {localProps.leftIcon}
        </span>
      </Show>

      <input
        class={inputVariants(variantProps)}
        aria-invalid={variantProps.color === "danger" ? "true" : undefined}
        {...localProps}
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
