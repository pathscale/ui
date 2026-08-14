import "./Switch.css";
import { Show, createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Switch.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Switch.recipe";

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

export type ToggleProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children" | "color"> &
  UIBaseProps & {
    defaultChecked?: boolean;
    children?: JSX.Element;
    description?: JSX.Element;
    icon?: JSX.Element;
    isDisabled?: boolean;
    color?: ToggleColor;
    size?: ToggleSize;
  };

const Switch: Layout<typeof componentRecipe, ToggleProps> = () => {
  const [local, others] = splitProps(props, [
    "class",
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
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.size[size()],
        CLASSES.color[color()],
        isDisabled() && CLASSES.flag.disabled,
        local.class,
      ) }}
      data-theme={local.dataTheme}
      data-slot="switch"
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        type="checkbox"
        role="switch"
        {...{ class: CLASSES.slot.input }}
        data-slot="switch-input"
        checked={isSelected()}
        disabled={isDisabled()}
        onChange={handleChange}
      />

      <span {...{ class: CLASSES.slot.control }} data-slot="switch-control" aria-hidden="true">
        <span {...{ class: CLASSES.slot.thumb }} data-slot="switch-thumb">
          <Show when={local.icon}>
            <span {...{ class: CLASSES.slot.icon }} data-slot="switch-icon">
              {local.icon}
            </span>
          </Show>
        </span>
      </span>

      <Show when={hasContent()}>
        <span {...{ class: CLASSES.slot.content }} data-slot="switch-content">
          <Show when={local.children}>
            <span data-slot="label">{local.children}</span>
          </Show>
          <Show when={local.description}>
            <span {...{ class: CLASSES.slot.description }} data-slot="description">
              {local.description}
            </span>
          </Show>
        </span>
      </Show>
    </label>
  );
};

export default Switch;
