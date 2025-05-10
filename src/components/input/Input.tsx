import {
  PolymorphicInput,
  type PolymorphicInputElementProps,
  type PolymorphicInputSharedProps,
  type PolymorphicProps,
} from "@src/components/polymorphic";
import { classes } from "@src/lib/style";
import {
  type Component,
  createSignal,
  type JSX,
  mergeProps,
  splitProps,
  type ValidComponent,
} from "solid-js";
import styles from "./Input.module.css";

export const variants = {
  color: {
    danger: styles.input__danger,
    success: styles.input__success,
    warning: styles.input__warning,
  },
  loading: styles["input--loading"],
  rounded: styles["input--rounded"],
  expanded: styles["input--expanded"],
} as const;

export type InputVariantProps = {
  color?: keyof typeof variants.color;
  loading?: boolean;
  rounded?: boolean;
  expanded?: boolean;
  passwordReveal?: boolean;
};

export type InputSharedProps<T extends ValidComponent = "input"> =
  PolymorphicInputSharedProps<T> & {
    class?: string;
    value?: string;
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
  };

export type InputElementProps = PolymorphicInputElementProps &
  InputSharedProps & {
    "aria-invalid"?: "true" | undefined;
  };

export type InputProps<T extends ValidComponent = "input"> = Partial<
  InputVariantProps & InputSharedProps<T>
>;

const Input = <T extends ValidComponent = "input">(
  props: PolymorphicProps<T, InputProps<T>>
) => {
  const defaultedProps = mergeProps({ type: "text" }, props);
  const [localProps, otherProps] = splitProps(defaultedProps as InputProps, [
    "class",
    "color",
    "loading",
    "rounded",
    "expanded",
    "passwordReveal",
    "type",
    "value",
    "onInput",
    "leftIcon",
    "rightIcon",
  ]);

  const [showPassword, setShowPassword] = createSignal(false);

  const computedType = () => {
    if (localProps.passwordReveal && showPassword()) {
      return "text";
    }

    return localProps.type;
  };

  return (
    <div class={styles.input__wrapper}>
      {localProps.leftIcon && (
        <span class={styles["input__icon--left"]}>{localProps.leftIcon}</span>
      )}

      <PolymorphicInput<
        Component<Omit<InputElementProps, keyof PolymorphicInputElementProps>>
      >
        class={classes(
          styles.input,
          localProps.color && variants.color[localProps.color],
          localProps.loading && variants.loading,
          localProps.rounded && variants.rounded,
          localProps.expanded && variants.expanded,
          localProps.class
        )}
        type={computedType()}
        value={localProps.value}
        onInput={localProps.onInput}
        aria-invalid={localProps.color === "danger" ? "true" : undefined}
        {...otherProps}
      />
      {localProps.rightIcon || localProps.passwordReveal ? (
        <span class={styles["input__icon--right"]}>
          {localProps.passwordReveal ? (
            <button
              type="button"
              onclick={() => setShowPassword(!showPassword())}
              class={styles.input__revealButton}
            >
              {localProps.rightIcon}
            </button>
          ) : (
            localProps.rightIcon
          )}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
