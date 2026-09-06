import "./Switch.css";
import type { JSX } from "@solidjs/web";
import { type Component, createSignal, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Flavor, State, UIBaseProps } from "../vocabulary";
import { CLASSES, componentRecipe } from "./Switch.recipe";

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

  /*
   * Driven from both `change` and `click`, because one renderer only sends one
   * of them.
   *
   * Blitz flips a checkbox's `checked` on a click but dispatches no `change`,
   * so a Switch wired to `change` alone reports the new state in the tree while
   * its callback never runs. Nothing caught it: `switch-toggles` asserts the
   * tree's `selected` flag, which the renderer flips on its own, so the check
   * passed on native behaviour with the component inert behind it. A panel that
   * used this Switch to reveal its fields revealed nothing.
   *
   * Browsers that send both must still act once, and the guard has to be per
   * interaction rather than per value: a controlled input whose DOM `checked`
   * does not move again would make every click after the first look like a
   * repeat and stick the toggle on.
   */
  let handledClick = false;

  const respond = (event: Event & { currentTarget: HTMLInputElement }) => {
    if (event.type === "click") {
      handledClick = true;
      // Cleared once this interaction's events have all been delivered, so the
      // next click is judged on its own.
      queueMicrotask(() => {
        handledClick = false;
      });
    } else if (handledClick) {
      return;
    }

    invokeEventHandler(props.onChange, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalSelected(event.currentTarget.checked);
    }
  };

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (
    event,
  ) => {
    respond(event as Event & { currentTarget: HTMLInputElement });
  };

  const handleClick: JSX.EventHandlerUnion<HTMLInputElement, MouseEvent> = (
    event,
  ) => {
    respond(event as unknown as Event & { currentTarget: HTMLInputElement });
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
        onClick={handleClick}
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
