import {
  type Component,
  createSignal,
  splitProps,
  type JSX,
  createMemo,
  untrack,
} from "solid-js";
import { switchVariants, checkVariants } from "./Switch.styles";
import type { VariantProps } from "@src/lib/style";

export type SwitchProps = {
  children?: JSX.Element;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
} & VariantProps<typeof switchVariants> &
  VariantProps<typeof checkVariants> &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange">;

const Switch: Component<SwitchProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    [
      "children",
      "checked",
      "defaultChecked",
      "onChange",
      "name",
      "required",
      "disabled",
      "aria-label",
      "aria-describedby",
    ],
    ["size", "rounded", "outlined", "color", "passiveColor", "disabled"]
  );

  const isControlled = localProps.checked !== undefined;
  const [internalChecked, setInternalChecked] = createSignal(
    localProps.defaultChecked ?? false
  );

  const checkedValue = createMemo(() =>
    untrack(() => (isControlled ? localProps.checked : internalChecked()))
  );

  const switchClasses = createMemo(() => switchVariants(variantProps));

  const checkClasses = createMemo(() =>
    checkVariants({
      size: variantProps.size,
      color: variantProps.color,
      passiveColor: variantProps.passiveColor,
      rounded: variantProps.rounded,
      outlined: variantProps.outlined,
      disabled: localProps.disabled,
    })
  );

  const handleChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    if (localProps.disabled) return;

    const next = e.currentTarget.checked;
    untrack(() => {
      if (!isControlled) setInternalChecked(next);
      localProps.onChange?.(next);
    });
  };

  return (
    <label
      class={switchClasses()}
      role="switch"
      aria-checked={checkedValue()}
      aria-label={localProps["aria-label"]}
      aria-describedby={localProps["aria-describedby"]}
    >
      <input
        type="checkbox"
        class="sr-only peer"
        checked={checkedValue()}
        onChange={handleChange}
        name={localProps.name}
        required={localProps.required}
        disabled={localProps.disabled}
        aria-hidden="true"
        {...otherProps}
      />

      <span class={checkClasses()} />
      <span class="control-label text-gray-800 dark:text-gray-200">
        {localProps.children}
      </span>
    </label>
  );
};

export default Switch;
