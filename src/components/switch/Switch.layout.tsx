import "./Switch.css";
import type { JSX } from "@solidjs/web";
import { type Component, createSignal, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Flavor, State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Switch.recipe";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type ToggleColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";
export type ToggleSize = "sm" | "md" | "lg";

export type ToggleProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "children" | "color"
> &
  UIBaseProps & {
    defaultChecked?: boolean;
    children?: JSX.Element;
    description?: JSX.Element;
    icon?: JSX.Element;
    state?: State;
    flavor?: Flavor;
    size?: ToggleSize;
  };

const Switch: Layout<typeof componentRecipe, ToggleProps> = () => {
  const others = omit(
    props,
    "class",
    "children",
    "description",
    "icon",
    "state",
    "flavor",
    "size",
    "checked",
    "defaultChecked",
    "disabled",
    "onChange",
    "dataTheme",
  );

  const [internalSelected, setInternalSelected] = createSignal(
    Boolean(props.defaultChecked),
  );

  const isControlled = () => props.checked !== undefined;
  const isSelected = () =>
    isControlled() ? Boolean(props.checked) : internalSelected();
  const isDisabled = () =>
    Boolean(props.state === "disabled") || Boolean(props.disabled);
  const color = () => props.flavor ?? "accent";
  const size = () => props.size ?? "md";
  const hasContent = () => props.children != null || props.description != null;

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (
    event,
  ) => {
    invokeEventHandler(props.onChange, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalSelected(event.currentTarget.checked);
    }
  };

  return (
    <label
      {...{
        class: twMerge(
          CLASSES.base,
          CLASSES.size[size()],
          CLASSES.flavor[color() as keyof typeof CLASSES.flavor] ??
            `switch--flavor-${color()}`,
          isDisabled() && CLASSES.flag.disabled,
          props.class,
        ),
      }}
      data-theme={props.dataTheme}
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

      <span
        {...{ class: CLASSES.slot.control }}
        data-slot="switch-control"
        aria-hidden="true"
      >
        <span
          {...{ class: CLASSES.slot.thumb }}
          data-slot="switch-thumb"
        >
          <Show when={props.icon}>
            <span
              {...{ class: CLASSES.slot.icon }}
              data-slot="switch-icon"
            >
              {props.icon}
            </span>
          </Show>
        </span>
      </span>

      <Show when={hasContent()}>
        <span
          {...{ class: CLASSES.slot.content }}
          data-slot="switch-content"
        >
          <Show when={props.children}>
            <span data-slot="label">{props.children}</span>
          </Show>
          <Show when={props.description}>
            <span
              {...{ class: CLASSES.slot.description }}
              data-slot="description"
            >
              {props.description}
            </span>
          </Show>
        </span>
      </Show>
    </label>
  );
};

export default Switch;
