import {
  type ComponentProps,
  createSignal,
  type JSX,
  mergeProps,
  Show,
  splitProps,
} from "solid-js";
import {
  inputWrapperClass,
  inputVariants,
  iconLeftClass,
  iconButtonClass,
  iconRightClass,
} from "./Input.styles";
import EyeIcon from "./EyeIcon";
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
    [
      "type",
      "passwordReveal",
      "leftIcon",
      "rightIcon",
      "class",
      "value",
      "onInput",
      "placeholder",
      "name",
    ],
    ["color", "rounded", "expanded", "loading", "hasLeftIcon", "hasRightIcon"]
  );

  const [showPassword, setShowPassword] = createSignal(false);

  const resolvedType = () =>
    localProps.passwordReveal && showPassword()
      ? "text"
      : localProps.type ?? "text";

  const inputClass = inputVariants({
    ...variantProps,
    hasLeftIcon: !!localProps.leftIcon,
    hasRightIcon: !!(localProps.rightIcon || localProps.passwordReveal),
    class: localProps.class,
  });

  return (
    <div class={inputWrapperClass}>
      <Show when={localProps.leftIcon}>
        <span class={iconLeftClass}>{localProps.leftIcon}</span>
      </Show>

      <input
        type={resolvedType()}
        class={inputClass}
        aria-invalid={variantProps.color === "danger" ? "true" : undefined}
        value={localProps.value}
        onInput={localProps.onInput}
        placeholder={localProps.placeholder}
        name={localProps.name}
      />

      <Show when={localProps.passwordReveal && !localProps.rightIcon}>
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          class={iconButtonClass}
        >
          <EyeIcon invisible={showPassword()} />
        </button>
      </Show>

      <Show when={localProps.rightIcon && !localProps.passwordReveal}>
        <span class={iconRightClass}>{localProps.rightIcon}</span>
      </Show>
    </div>
  );
};

export default Input;
