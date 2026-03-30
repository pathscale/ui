import { clsx } from "clsx";
import { createUniqueId, Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { ComponentColor, ComponentSize, IComponentBaseProps } from "../types";
import Toggle from "../toggle/Toggle";

type SwitchFieldBaseProps = {
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: ComponentSize;
  color?: ComponentColor;
  error?: string;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type SwitchFieldProps = SwitchFieldBaseProps & IComponentBaseProps;

const SwitchField = (props: SwitchFieldProps): JSX.Element => {
  const id = createUniqueId();
  const toggleId = `switch-field-input-${id}`;
  const descriptionId = `switch-field-desc-${id}`;
  const errorId = `switch-field-error-${id}`;

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

  const classes = () =>
    twMerge(
      "flex items-center justify-between gap-4",
      local.class,
      local.className,
      clsx({
        "opacity-50": local.disabled,
      }),
    );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      <div class="flex flex-col">
        <label
          for={toggleId}
          class={clsx("text-sm font-medium", local.disabled ? "cursor-not-allowed" : "cursor-pointer")}
        >
          {local.label}
        </label>
        {local.description && (
          <span id={descriptionId} class="text-xs opacity-60">
            {local.description}
          </span>
        )}
        <Show when={local.error}>
          <span id={errorId} role="alert" class="text-error text-xs">
            {local.error}
          </span>
        </Show>
      </div>
      <Toggle
        id={toggleId}
        checked={local.checked}
        disabled={local.disabled}
        size={local.size}
        color={local.color}
        aria-describedby={
          [local.description ? descriptionId : "", local.error ? errorId : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onChange={(e) => local.onChange?.(e.currentTarget.checked)}
      />
    </div>
  );
};

export default SwitchField;
