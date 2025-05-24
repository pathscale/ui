import { type JSX, splitProps, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";
import Button from "../button/Button";
import type { ButtonProps } from "../Button/Button";

export type DropdownToggleProps = JSX.LabelHTMLAttributes<HTMLLabelElement> &
  IComponentBaseProps & {
    color?: ComponentColor;
    size?: ComponentSize;
    button?: boolean;
    disabled?: boolean;
  };

const DropdownToggle = (props: DropdownToggleProps): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "children",
    "color",
    "size",
    "button",
    "dataTheme",
    "class",
    "className",
    "disabled",
  ]);

  const classAttr = () => twMerge(local.class, local.className);

  return (
    <label
      tabindex={0}
      class={classAttr()}
      {...rest}
      data-theme={local.dataTheme}
    >
      <Show when={local.button} fallback={local.children}>
        <Button
          type="button"
          color={local.color}
          size={local.size}
          dataTheme={local.dataTheme}
          disabled={local.disabled}
        >
          {local.children}
        </Button>
      </Show>
    </label>
  );
};

export default DropdownToggle;
