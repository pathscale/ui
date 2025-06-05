import { JSX, splitProps, Show } from "solid-js";
import Button, { type ButtonProps } from "../button/Button";
import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

export type DropdownToggleProps = Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "color"
> &
  IComponentBaseProps & {
    color?: ComponentColor;
    size?: ComponentSize;
    button?: boolean;
    disabled?: boolean;
    id?: string;
    role?: string;
    // ARIA attributes
    "aria-haspopup"?: boolean | "menu" | "listbox" | "dialog" | "grid" | "tree";
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  };

const DropdownToggle = (props: DropdownToggleProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "color",
    "size",
    "button",
    "disabled",
    "dataTheme",
    "class",
    "id",
    "role",
    "aria-haspopup",
    "aria-expanded",
    "aria-controls",
  ]);

  const commonAriaProps = {
    id: local.id,
    role: local.role,
    "aria-haspopup": local["aria-haspopup"],
    "aria-expanded": local["aria-expanded"],
    "aria-controls": local["aria-controls"],
  };

  return (
    <label tabIndex={0} {...others} {...commonAriaProps} class={local.class}>
      <Show when={local.button} fallback={local.children}>
        <Button
          type="button"
          dataTheme={local.dataTheme}
          color={local.color}
          size={local.size}
          disabled={local.disabled}
          {...commonAriaProps}
        >
          {local.children}
        </Button>
      </Show>
    </label>
  );
};

export type SummaryProps = JSX.HTMLAttributes<HTMLElement>;

export const Summary = (props: SummaryProps) => {
  return <summary {...props}>{props.children}</summary>;
};

export default DropdownToggle;
