import { type ElementOf, mergeRefs } from "@src/lib/refs";
import {
  createSignal,
  type Ref,
  splitProps,
  type ValidComponent,
} from "solid-js";
import Polymorphic, { type PolymorphicProps } from "./Polymorphic";

export type PolymorphicInputSharedProps<T extends ValidComponent = "input"> = {
  ref: Ref<ElementOf<T>>;
  type: string | undefined;
};

export type PolymorphicInputElementProps = PolymorphicInputSharedProps & {
  role: "textbox" | undefined;
};

export type PolymorphicInputProps<T extends ValidComponent = "input"> = Partial<
  PolymorphicInputSharedProps<T>
>;

const PolymorphicInput = <T extends ValidComponent = "input">(
  props: PolymorphicProps<T, PolymorphicInputProps<T>>
) => {
  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const [localProps, otherProps] = splitProps(props as PolymorphicInputProps, [
    "ref",
    "type",
  ]);

  return (
    <Polymorphic<PolymorphicInputElementProps>
      as="input"
      ref={mergeRefs(setRef, localProps.ref)}
      type={localProps.type}
      role="textbox"
      {...otherProps}
    />
  );
};

export default PolymorphicInput;
