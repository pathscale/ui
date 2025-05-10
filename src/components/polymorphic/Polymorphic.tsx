import type { OverrideProps } from "@src/lib/props";
import {
  type ComponentProps,
  createMemo,
  type JSX,
  splitProps,
  untrack,
  type ValidComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";

export type PolymorphicAttributes<T extends ValidComponent> = {
  /**
   * Component to render the polymorphic component as.
   * @defaultValue `div`
   */
  as?: T | keyof JSX.HTMLElementTags;
};

export type PolymorphicProps<
  T extends ValidComponent,
  P extends object,
> = OverrideProps<ComponentProps<T>, P & PolymorphicAttributes<T>>;

/**
 * Renders as a div by default and can be overridden with the `as` property.
 */
const Polymorphic = <ElementProps,>(
  props: PolymorphicAttributes<ValidComponent> & ElementProps,
) => {
  const [localProps, otherProps] = splitProps(props, ["as"]);

  // biome-ignore lint: types are valid
  const cached = createMemo<Function | string>(() => localProps.as ?? "div");

  return createMemo(() => {
    const component = cached();
    switch (typeof component) {
      case "function":
        return untrack(() => component(otherProps));
      case "string":
        return (
          <Dynamic
            component={component}
            {...otherProps}
          />
        );
    }
  }) as unknown as JSX.Element;
};

export default Polymorphic;
