import "./Switch.css";
import type { JSX } from "@solidjs/web";
import { type Component, createSignal, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import type { Flavor, State, UIBaseProps } from "../vocabulary";
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

export type ToggleColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";
export type ToggleSize = "sm" | "md" | "lg";

export type ToggleProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "children" | "color" | "onChange"
> &
  UIBaseProps & {
    defaultChecked?: boolean;
    children?: JSX.Element;
    description?: JSX.Element;
    icon?: JSX.Element;
    state?: State;
    flavor?: Flavor;
    size?: ToggleSize;
    /**
     * The new checked state.
     *
     * **Breaking in 3.1.** This used to be the input's native `onChange`, so it
     * handed you an `Event` while `Slider`, `RadioGroup` and `CheckboxGroup`
     * handed you a value. One name meant two things depending on which control
     * you reached for, which made swapping one field for another quietly
     * dangerous. Every control in the library now reports its new value here.
     *
     * The native handler has not gone away: it is {@link onNativeChange}, and
     * it is still where you call `preventDefault()`.
     */
    onChange?: (checked: boolean) => void;
    /**
     * The underlying `change` event, before the toggle is applied.
     *
     * This is the veto: `preventDefault()` here leaves the switch as it was and
     * suppresses {@link onChange}. Reach for it when you need the event itself;
     * for the value, use `onChange`.
     */
    onNativeChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;
  };

const Switch: Layout<typeof componentRecipe, ToggleProps> = () => {
  const others = omit(
    props,
    "class",
    "onNativeChange",
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
  const hasContent = () => props.children != null || props.description != null;

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (
    event,
  ) => {
    // The event handler first, so `preventDefault()` still vetoes both the
    // toggle and the value callback. Order is the contract here.
    invokeEventHandler(props.onNativeChange, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    const checked = event.currentTarget.checked;
    if (!isControlled()) {
      setInternalSelected(checked);
    }
    props.onChange?.(checked);
  };

  return (
    <label
      {...slot.root}
      data-theme={props.dataTheme}
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        type="checkbox"
        role="switch"
        {...slot.input}
        checked={isSelected()}
        disabled={isDisabled()}
        onChange={handleChange}
      />

      <span
        {...slot.control}
        aria-hidden="true"
      >
        <span
          {...slot.thumb}
        >
          <Show when={props.icon}>
            <span
              {...slot.icon}
            >
              {props.icon}
            </span>
          </Show>
        </span>
      </span>

      <Show when={hasContent()}>
        <span
          {...slot.content}
        >
          <Show when={props.children}>
            <span {...slot.label}>{props.children}</span>
          </Show>
          <Show when={props.description}>
            <span {...slot.description}>{props.description}</span>
          </Show>
        </span>
      </Show>
    </label>
  );
};

export default Switch;
