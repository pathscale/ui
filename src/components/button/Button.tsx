import {
  PolymorphicButton,
  type PolymorphicButtonElementProps,
  type PolymorphicButtonSharedProps,
  type PolymorphicProps,
} from "@src/components/polymorphic";
import {
  type Component,
  mergeProps,
  splitProps,
  type ValidComponent,
  createMemo,
} from "solid-js";
import { buttonVariants } from "./Button.styles";
import type { ClassProps, VariantProps } from "@src/lib/style";

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonSharedProps<T extends ValidComponent = "button"> =
  PolymorphicButtonSharedProps<T> & ClassProps;

export type ButtonElementProps = PolymorphicButtonElementProps &
  ButtonSharedProps & {
    "aria-busy": "true" | undefined;
  };

export type ButtonProps<T extends ValidComponent = "button"> =
  Partial<ButtonVariantProps> & Partial<ButtonSharedProps<T>>;

const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>
) => {
  const defaultedProps = mergeProps(
    {
      color: "primary",
    } satisfies Partial<ButtonProps<T>>,
    props
  );

  const [variantProps, otherProps] = splitProps(defaultedProps as ButtonProps, [
    "class",
    ...buttonVariants.variantKeys,
  ]);

  const classes = createMemo(() => buttonVariants(variantProps));

  return (
    <PolymorphicButton<
      Component<Omit<ButtonElementProps, keyof PolymorphicButtonElementProps>>
    >
      class={classes()}
      aria-busy={variantProps.loading ? "true" : undefined}
      {...otherProps}
    />
  );
};

export default Button;
