import { type Component, splitProps, Show, createMemo } from "solid-js";
import { selectVariants } from "./Select.styles";
import { type VariantProps, type ClassProps, classes } from "@src/lib/style";
import type { ComponentProps } from "solid-js";

export type SelectProps = VariantProps<typeof selectVariants> &
  ClassProps &
  ComponentProps<"select"> & {
    placeholder?: string;
    nativeSize?: string | number;
    value?: string | number | null;
  };

const Select: Component<SelectProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    ["placeholder", "value", "nativeSize", "onChange", "onBlur", "onFocus"],
    ["class", ...selectVariants.variantKeys]
  );

  const empty = createMemo(
    () => localProps.value === null || localProps.value === undefined
  );

  return (
    <select
      class={selectVariants(variantProps)}
      size={localProps.nativeSize as number | undefined}
      value={localProps.value ?? ""}
      onChange={(e) => {
        typeof localProps.onChange === "function" && localProps.onChange?.(e);
      }}
      onFocus={(e) => {
        typeof localProps.onFocus === "function" && localProps.onFocus?.(e);
      }}
      onBlur={(e) => {
        typeof localProps.onBlur === "function" && localProps.onBlur?.(e);
      }}
      {...otherProps}
    >
      <Show when={localProps.placeholder && empty()}>
        <option value="" disabled hidden>
          {localProps.placeholder}
        </option>
      </Show>
      {props.children}
    </select>
  );
};

export default Select;
