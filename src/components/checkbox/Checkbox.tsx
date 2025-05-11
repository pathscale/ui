import {
  type Component,
  createSignal,
  splitProps,
  Show,
  createEffect,
} from "solid-js";
import type { JSX } from "solid-js";
import { checkboxVariants } from "./Checkbox.styles";
import { type VariantProps, type ClassProps, classes } from "@src/lib/style";
import type { ComponentProps } from "solid-js";

export type CheckboxProps = VariantProps<typeof checkboxVariants> &
  ClassProps &
  ComponentProps<"input"> & {
    indeterminate?: boolean;
    label?: JSX.Element;
  };

const Checkbox: Component<CheckboxProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    [
      "label",
      "indeterminate",
      "type",
      "onChange",
      "onFocus",
      "onBlur",
      "checked",
      "disabled",
    ],
    ["class", ...checkboxVariants.variantKeys]
  );

  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();

  createEffect(() => {
    if (inputRef()) {
      inputRef()!.indeterminate = !!localProps.indeterminate;
    }
  });

  return (
    <label class={checkboxVariants(variantProps)}>
      <input
        ref={setInputRef}
        type="checkbox"
        class="peer absolute opacity-0 w-4 h-4"
        checked={localProps.checked}
        disabled={localProps.disabled}
        {...otherProps}
        onChange={(e) => {
          typeof localProps.onChange === "function" && localProps.onChange?.(e);
        }}
        onFocus={(e) => {
          typeof localProps.onFocus === "function" && localProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          typeof localProps.onBlur === "function" && localProps.onBlur?.(e);
        }}
      />

      <span
        class={classes(
          "inline-block w-4 h-4 border border-gray-400 rounded-sm peer-checked:bg-current",
          localProps.indeterminate ? "bg-gray-400 relative" : ""
        )}
      >
        <Show when={localProps.indeterminate}>
          <span class="absolute top-1/2 left-1/2 w-2 h-0.5 bg-white -translate-x-1/2 -translate-y-1/2" />
        </Show>
      </span>

      <Show when={localProps.label}>
        <span>{localProps.label}</span>
      </Show>
    </label>
  );
};

export default Checkbox;
