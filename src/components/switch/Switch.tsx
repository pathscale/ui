import {
  type Component,
  createSignal,
  onCleanup,
  splitProps,
  type JSX,
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
} & VariantProps<typeof switchVariants> &
  VariantProps<typeof checkVariants> &
  JSX.InputHTMLAttributes<HTMLInputElement>;

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
    ],
    ["size", "rounded", "outlined", "color", "passiveColor"]
  );

  const isControlled = localProps.checked !== undefined;
  const [internalChecked, setInternalChecked] = createSignal(
    localProps.defaultChecked ?? false
  );

  const checkedValue = () =>
    isControlled ? localProps.checked : internalChecked();

  const handleChange = (e: Event) => {
    const next = (e.currentTarget as HTMLInputElement).checked;
    if (!isControlled) setInternalChecked(next);
    localProps.onChange?.(next);
  };

  return (
    <label class={switchVariants(variantProps)}>
      <input
        type="checkbox"
        class="sr-only peer"
        checked={checkedValue()}
        onChange={handleChange}
        name={localProps.name}
        required={localProps.required}
        disabled={localProps.disabled}
        {...otherProps}
      />

      <span
        class={checkVariants({
          size: variantProps.size,
          color: variantProps.color,
          passiveColor: variantProps.passiveColor,
          rounded: variantProps.rounded,
          outlined: variantProps.outlined,
        })}
      />
      <span class="control-label">{localProps.children}</span>
    </label>
  );
};

export default Switch;
