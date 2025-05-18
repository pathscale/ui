import {
  type Component,
  splitProps,
  createSignal,
  createMemo,
  Show,
  untrack,
  createEffect,
} from "solid-js";
import type { JSX } from "solid-js";
import {
  checkboxVariants,
  checkboxMarkerVariants,
  checkboxInputClass,
  checkboxLabelClass,
} from "./Checkbox.styles";
import { type VariantProps, type ClassProps, classes } from "@src/lib/style";
import type { ComponentProps } from "solid-js";
import CheckIcon from "./CheckIcon";
import MinusIcon from "./MinusIcon";

type CheckboxVisualState = "indeterminate" | "checked" | "unchecked";

export type CheckboxProps = VariantProps<typeof checkboxVariants> &
  ClassProps &
  Omit<ComponentProps<"input">, "onChange" | "onFocus" | "onBlur"> & {
    indeterminate?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: JSX.Element;
    onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;
    onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
  };

const Checkbox: Component<CheckboxProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    [
      "label",
      "indeterminate",
      "defaultChecked",
      "checked",
      "onChange",
      "onFocus",
      "onBlur",
      "disabled",
    ],
    ["class", ...checkboxVariants.variantKeys]
  );

  let inputRef: HTMLInputElement | undefined;

  const isControlled = localProps.checked !== undefined;

  const [status, setStatus] = createSignal<CheckboxVisualState>(
    localProps.indeterminate
      ? "indeterminate"
      : isControlled
      ? localProps.checked
        ? "checked"
        : "unchecked"
      : localProps.defaultChecked
      ? "checked"
      : "unchecked"
  );

  createEffect(() => {
    if (isControlled) {
      setStatus(
        localProps.indeterminate
          ? "indeterminate"
          : localProps.checked
          ? "checked"
          : "unchecked"
      );
    }
  });

  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    const input = e.currentTarget;

    if (input.indeterminate) {
      input.indeterminate = false;
      input.checked = true;
      setStatus("checked");
    } else {
      setStatus(input.checked ? "checked" : "unchecked");
    }

    untrack(() => {
      if (typeof localProps.onChange === "function") {
        localProps.onChange(e);
      }
    });
  };

  return (
    <label
      class={checkboxVariants()}
      role="checkbox"
      aria-checked={
        status() === "indeterminate" ? "mixed" : status() === "checked"
      }
    >
      <input
        ref={(el) => {
          inputRef = el;
          if (status() === "indeterminate") {
            el.indeterminate = true;
          }
        }}
        type="checkbox"
        class={checkboxInputClass}
        checked={status() === "checked"}
        disabled={localProps.disabled}
        aria-hidden="true"
        {...otherProps}
        onChange={handleChange}
        onFocus={localProps.onFocus}
        onBlur={localProps.onBlur}
      />

      <span
        class={checkboxMarkerVariants({
          size: variantProps.size,
          color: status() !== "unchecked" ? variantProps.color : undefined,
          variant: status() !== "unchecked" ? "colored" : "default",
        })}
      >
        <Show when={status() !== "unchecked"}>
          {status() === "indeterminate" ? <MinusIcon /> : <CheckIcon />}
        </Show>
      </span>

      <Show when={localProps.label}>
        <span class={checkboxLabelClass}>{localProps.label}</span>
      </Show>
    </label>
  );
};

export default Checkbox;
