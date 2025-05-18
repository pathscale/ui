import {
  type Component,
  splitProps,
  Show,
  createMemo,
  type JSX,
  untrack,
} from "solid-js";
import {
  selectVariants,
  wrapperClass,
  selectPaddingClass,
  caretIconBaseClass,
  spinnerIconBaseClass,
  getIconColor,
  getSpinnerColor,
} from "./Select.styles";
import CaretDownIcon from "./CaretDownIcon";
import SpinnerIcon from "./SpinnerIcon";
import { type VariantProps, type ClassProps, classes } from "@src/lib/style";
import type { ComponentProps } from "solid-js";

export type SelectProps = VariantProps<typeof selectVariants> &
  ClassProps &
  ComponentProps<"select"> & {
    placeholder?: string;
    nativeSize?: string | number;
    value?: string | number | null;
    onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
    onFocus?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
  };

const Select: Component<SelectProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    ["placeholder", "value", "nativeSize", "onChange", "onFocus", "onBlur"],
    ["class", ...selectVariants.variantKeys]
  );

  const empty = createMemo(() =>
    untrack(() => localProps.value === null || localProps.value === undefined)
  );

  const selectClass = createMemo(() =>
    classes(
      selectVariants(variantProps),
      variantProps.class,
      selectPaddingClass
    )
  );

  return (
    <div class={wrapperClass}>
      <select
        class={selectClass()}
        size={localProps.nativeSize}
        value={localProps.value}
        onChange={localProps.onChange}
        onFocus={localProps.onFocus}
        onBlur={localProps.onBlur}
        {...otherProps}
      >
        <Show when={localProps.placeholder && empty()}>
          <option value="" disabled hidden>
            {localProps.placeholder}
          </option>
        </Show>
        {props.children}
      </select>

      <Show when={variantProps.loading}>
        <SpinnerIcon
          class={`${spinnerIconBaseClass} ${getSpinnerColor(
            variantProps.color
          )}`}
        />
      </Show>

      <Show when={!variantProps.loading}>
        <CaretDownIcon
          class={`${caretIconBaseClass} ${getIconColor(variantProps.color)}`}
        />
      </Show>
    </div>
  );
};

export default Select;
