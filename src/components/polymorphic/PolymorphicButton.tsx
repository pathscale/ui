import { type ElementOf, mergeRefs } from "@src/lib/refs";
import { createIsButton } from "@src/lib/tag";
import {
  createSignal,
  type Ref,
  splitProps,
  type ValidComponent,
} from "solid-js";
import Polymorphic, { type PolymorphicProps } from "./Polymorphic";

export type PolymorphicButtonSharedProps<T extends ValidComponent = "button"> =
  {
    ref: Ref<ElementOf<T>>;
  };

export type PolymorphicButtonElementProps = PolymorphicButtonSharedProps & {
  role: "button" | undefined;
};

export type PolymorphicButtonProps<T extends ValidComponent = "button"> =
  Partial<PolymorphicButtonSharedProps<T>>;

/**
 * An accessible button that sets `type` and `role` properly based on
 * if it's a native button.
 */
const PolymorphicButton = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, PolymorphicButtonProps<T>>
) => {
  const [ref, setRef] = createSignal<HTMLElement | null>(null);

  const [localProps, otherProps] = splitProps(props as PolymorphicButtonProps, [
    "ref",
  ]);

  const isButton = createIsButton({
    element: ref,
    type: props.type,
  });

  return (
    <Polymorphic<PolymorphicButtonElementProps>
      as="button"
      ref={mergeRefs(setRef, localProps.ref)}
      role={!isButton() ? "button" : undefined}
      {...otherProps}
    />
  );
};

export default PolymorphicButton;
