import "./Radio.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit, Show, useContext } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import { RadioGroupContext } from "../radio-group/context";
import type { Issue, State, UIBaseProps } from "../vocabulary";
import { resolveState } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Radio.recipe";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type RadioProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
    description?: JSX.Element;
    indicator?: JSX.Element;
    state?: State;
    issues?: Issue[];
  };

const Radio: Layout<typeof componentRecipe, RadioProps> = () => {
  const group = useContext(RadioGroupContext);
  const others = omit(
    props,
    "class",
    "children",
    "description",
    "indicator",
    "state",
    "issues",
    "disabled",
    "checked",
    "value",
    "name",
    "onChange",
    "dataTheme",
    "aria-invalid",
  );

  const value = () => (props.value != null ? String(props.value) : undefined);
  const isGrouped = () => Boolean(group && value() !== undefined);
  const isSelected = () =>
    isGrouped() ? group?.value() === value() : Boolean(props.checked);
  const isDisabled = () =>
    Boolean(props.state === "disabled") ||
    Boolean(props.disabled) ||
    Boolean(group?.isDisabled());
  const isInvalid = () =>
    Boolean(resolveState(props.state, props.issues) === "invalid") ||
    Boolean(local["aria-invalid"]) ||
    Boolean(group?.isInvalid());
  const name = () => props.name ?? group?.name();
  const ariaInvalid = () =>
    local["aria-invalid"] ?? (isInvalid() ? true : undefined);

  const hasContent = () => props.children != null || props.description != null;

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (
    event,
  ) => {
    invokeEventHandler(props.onChange, event);
    if (event.defaultPrevented) return;

    if (event.currentTarget.checked && group && value() !== undefined) {
      group.selectValue(value() as string, event);
    }
  };

  return (
    <label
      {...{
        class: twMerge(
          CLASSES.base,
          isDisabled() && CLASSES.flag.disabled,
          props.class,
        ),
      }}
      data-theme={props.dataTheme}
      data-slot="radio"
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        type="radio"
        value={props.value}
        name={name()}
        checked={isGrouped() ? isSelected() : props.checked}
        disabled={isDisabled()}
        {...{ class: CLASSES.slot.input }}
        data-slot="radio-input"
        aria-invalid={ariaInvalid() ? "true" : "false"}
        onChange={handleChange}
      />

      <span
        {...{ class: CLASSES.slot.control }}
        data-slot="radio-control"
        aria-hidden="true"
      >
        <span
          {...{ class: CLASSES.slot.indicator }}
          data-slot="radio-indicator"
        >
          {props.indicator}
        </span>
      </span>

      <Show when={hasContent()}>
        <span
          {...{ class: CLASSES.slot.content }}
          data-slot="radio-content"
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

export default Radio;
