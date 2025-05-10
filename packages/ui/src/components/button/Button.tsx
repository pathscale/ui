import {
  PolymorphicButton,
  type PolymorphicButtonElementProps,
  type PolymorphicButtonSharedProps,
  type PolymorphicProps,
} from "@src/components/polymorphic";
import { classes } from "@src/lib/style";
import {
  type Component,
  mergeProps,
  splitProps,
  type ValidComponent,
} from "solid-js";
import styles from "./Button.module.css";

export const variants = {
  color: {
    inverse: styles["button__inverse"],
    primary: styles["button__primary"],
    secondary: styles["button__secondary"],
    tertiary: styles["button__tertiary"],
    accent: styles["button__accent"],
    positive: styles["button__positive"],
    destructive: styles["button__destructive"],
  },
  loading: styles["button--loading"],
} as const;

export type ButtonVariantProps = {
  color: keyof typeof variants.color;
  loading: boolean;
};

export type ButtonSharedProps<T extends ValidComponent = "button"> =
  PolymorphicButtonSharedProps<T> & {
    class: string | undefined;
  };

export type ButtonElementProps = PolymorphicButtonElementProps &
  ButtonSharedProps & {
    "aria-busy": "true" | undefined;
  };

export type ButtonProps<T extends ValidComponent = "button"> =
  Partial<ButtonVariantProps> & Partial<ButtonSharedProps<T>>;

const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>,
) => {
  const defaultedProps = mergeProps(
    {
      color: "primary",
    } satisfies Partial<ButtonProps<T>>,
    props,
  );

  const [localProps, otherProps] = splitProps(defaultedProps as ButtonProps, [
    "class",
    "color",
    "loading",
  ]);

  return (
    <PolymorphicButton<
      Component<Omit<ButtonElementProps, keyof PolymorphicButtonElementProps>>
    >
      // === SharedProps ===
      class={classes(
        styles.button,
        localProps.color && variants.color[localProps.color],
        localProps.loading && variants.loading,
        localProps.class,
      )}
      // === ElementProps ===
      aria-busy={localProps.loading ? "true" : undefined}
      {...otherProps}
    />
  );
};

export default Button;
