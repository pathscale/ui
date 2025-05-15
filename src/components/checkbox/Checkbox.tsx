import {
  type Component,
  splitProps,
  Show,
  createEffect,
  createMemo,
  untrack,
} from "solid-js";
import type { JSX } from "solid-js";
import { checkboxVariants } from "./Checkbox.styles";
import { type VariantProps, type ClassProps, classes } from "@src/lib/style";
import type { ComponentProps } from "solid-js";

export type CheckboxProps = VariantProps<typeof checkboxVariants> &
  ClassProps &
  Omit<ComponentProps<"input">, "onChange" | "onFocus" | "onBlur"> & {
    indeterminate?: boolean;
    label?: JSX.Element;
    onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;
    onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    "aria-label"?: string;
    "aria-describedby"?: string;
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
      "aria-label",
      "aria-describedby",
    ],
    ["class", ...checkboxVariants.variantKeys]
  );

  let inputRef: HTMLInputElement | undefined;

  const checkboxClasses = createMemo(() => checkboxVariants(variantProps));

  const markerClasses = createMemo(() =>
    classes(
      "inline-block w-4 h-4 border border-gray-400 rounded-sm peer-checked:bg-current",
      localProps.indeterminate ? "bg-gray-400 relative" : ""
    )
  );

  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    untrack(() => {
      if (typeof localProps.onChange === "function") {
        localProps.onChange(e);
      }
    });
  };

  const handleFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = (e) => {
    untrack(() => {
      if (typeof localProps.onFocus === "function") {
        localProps.onFocus(e);
      }
    });
  };

  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (e) => {
    untrack(() => {
      if (typeof localProps.onBlur === "function") {
        localProps.onBlur(e);
      }
    });
  };

  createEffect(() => {
    if (inputRef) {
      untrack(() => {
        inputRef.indeterminate = !!localProps.indeterminate;
      });
    }
  });

  return (
    <label
      class={checkboxClasses()}
      role="checkbox"
      aria-checked={localProps.indeterminate ? "mixed" : localProps.checked}
      aria-label={localProps["aria-label"]}
      aria-describedby={localProps["aria-describedby"]}
    >
      <input
        ref={inputRef}
        type="checkbox"
        class="peer absolute opacity-0 w-4 h-4"
        checked={localProps.checked}
        disabled={localProps.disabled}
        aria-hidden="true"
        {...otherProps}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <span class={markerClasses()}>
        <Show when={localProps.indeterminate}>
          <span
            class="absolute top-1/2 left-1/2 w-2 h-0.5 bg-white -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
        </Show>
      </span>

      <Show when={localProps.label}>
        <span class="ml-2">{localProps.label}</span>
      </Show>
    </label>
  );
};

export default Checkbox;
