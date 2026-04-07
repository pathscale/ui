import { splitProps, Show, type JSX } from "solid-js";
import Toggle from "../toggle/Toggle";
import type { IComponentBaseProps } from "../types";
import type { ToggleColor, ToggleSize } from "../toggle/Toggle";

/**
 * @deprecated Use `<Toggle>` directly instead.
 * SwitchField is now a thin wrapper around Toggle for backwards compatibility.
 */
export type SwitchFieldProps = IComponentBaseProps & {
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  color?: ToggleColor;
  error?: string;
};

const SwitchField = (props: SwitchFieldProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "label",
    "description",
    "checked",
    "onChange",
    "disabled",
    "size",
    "color",
    "error",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  return (
    <div>
      <Toggle
        checked={local.checked}
        disabled={local.disabled}
        size={local.size}
        color={local.color}
        description={local.description}
        dataTheme={local.dataTheme}
        class={local.class}
        className={local.className}
        style={local.style}
        onChange={(e) => local.onChange?.(e.currentTarget.checked)}
      >
        {local.label}
      </Toggle>
      <Show when={local.error}>
        <span role="alert" style={{ color: "var(--color-error)", "font-size": "0.75rem", "margin-top": "0.25rem", display: "block" }}>
          {local.error}
        </span>
      </Show>
    </div>
  );
};

export default SwitchField;
