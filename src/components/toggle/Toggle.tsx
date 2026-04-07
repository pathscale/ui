import "./Toggle.css";
import { Show, createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type ToggleColor = "default" | "accent" | "success" | "warning" | "danger";
export type ToggleSize = "sm" | "md" | "lg";

const TOGGLE_COLOR_CLASS: Record<ToggleColor, string> = {
  default: "toggle--default",
  accent: "toggle--accent",
  success: "toggle--success",
  warning: "toggle--warning",
  danger: "toggle--danger",
};

const TOGGLE_SIZE_CLASS: Record<ToggleSize, string> = {
  sm: "toggle--sm",
  md: "toggle--md",
  lg: "toggle--lg",
};

export type ToggleProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children" | "color"> &
  IComponentBaseProps & {
    defaultChecked?: boolean;
    children?: JSX.Element;
    description?: JSX.Element;
    icon?: JSX.Element;
    isDisabled?: boolean;
    color?: ToggleColor;
    size?: ToggleSize;
  };

const Toggle: Component<ToggleProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "description",
    "icon",
    "isDisabled",
    "color",
    "size",
    "checked",
    "defaultChecked",
    "disabled",
    "onChange",
    "dataTheme",
  ]);

  const [internalSelected, setInternalSelected] = createSignal(Boolean(local.defaultChecked));

  const isControlled = () => local.checked !== undefined;
  const isSelected = () => (isControlled() ? Boolean(local.checked) : internalSelected());
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const color = () => local.color ?? "accent";
  const size = () => local.size ?? "md";
  const hasContent = () => local.children != null || local.description != null;

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    invokeEventHandler(local.onChange, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalSelected(event.currentTarget.checked);
    }
  };

  return (
    <label
      class={twMerge(
        "toggle",
        TOGGLE_SIZE_CLASS[size()],
        TOGGLE_COLOR_CLASS[color()],
        isDisabled() && "toggle--disabled",
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="toggle"
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        type="checkbox"
        role="switch"
        class="toggle__input"
        data-slot="toggle-input"
        checked={isSelected()}
        disabled={isDisabled()}
        onChange={handleChange}
      />

      <span class="toggle__control" data-slot="toggle-control" aria-hidden="true">
        <span class="toggle__thumb" data-slot="toggle-thumb">
          <Show when={local.icon}>
            <span class="toggle__icon" data-slot="toggle-icon">
              {local.icon}
            </span>
          </Show>
        </span>
      </span>

      <Show when={hasContent()}>
        <span class="toggle__content" data-slot="toggle-content">
          <Show when={local.children}>
            <span data-slot="label">{local.children}</span>
          </Show>
          <Show when={local.description}>
            <span class="toggle__description" data-slot="description">
              {local.description}
            </span>
          </Show>
        </span>
      </Show>
    </label>
  );
};

export default Toggle;
