import { JSX, splitProps, Show } from "solid-js";
import Button, { type ButtonProps } from "../button/Button";
import type { ComponentColor, ComponentSize, IComponentBaseProps } from "../types";

export type DropdownToggleProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "color"> &
  IComponentBaseProps & {
    color?: ComponentColor;
    size?: ComponentSize;
    button?: boolean;
    disabled?: boolean;
  };

const DropdownToggle = (props: DropdownToggleProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "color",
    "size",
    "button",
    "dataTheme",
    "class",
    "disabled",
  ]);

  return (
    <label tabIndex={0} {...others} class={local.class}>
      <Show when={local.button} fallback={local.children}>
        <Button
          type="button"
          dataTheme={local.dataTheme}
          color={local.color}
          size={local.size}
          disabled={local.disabled}
        >
          {local.children}
        </Button>
      </Show>
    </label>
  );
};

export type SummaryProps = Omit<ButtonProps, "tag">;

export const Summary = (props: SummaryProps) => {
  return <Button {...props} tag="summary" />;
};

export default DropdownToggle;
