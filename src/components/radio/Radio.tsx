import "./Radio.css";
import { Show, splitProps, useContext, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { RadioGroupContext } from "../radio-group/context";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Radio.classes";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type RadioProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    description?: JSX.Element;
    indicator?: JSX.Element;
    isDisabled?: boolean;
    isInvalid?: boolean;
  };

const Radio: Component<RadioProps> = (props) => {
  const group = useContext(RadioGroupContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "description",
    "indicator",
    "isDisabled",
    "isInvalid",
    "disabled",
    "checked",
    "value",
    "name",
    "onChange",
    "dataTheme",
    "aria-invalid",
  ]);

  const value = () => (local.value != null ? String(local.value) : undefined);
  const isGrouped = () => Boolean(group && value() !== undefined);
  const isSelected = () => (isGrouped() ? group?.value() === value() : Boolean(local.checked));
  const isDisabled = () =>
    Boolean(local.isDisabled) || Boolean(local.disabled) || Boolean(group?.isDisabled());
  const isInvalid = () =>
    Boolean(local.isInvalid) || Boolean(local["aria-invalid"]) || Boolean(group?.isInvalid());
  const name = () => local.name ?? group?.name();
  const ariaInvalid = () => local["aria-invalid"] ?? (isInvalid() ? true : undefined);

  const hasContent = () => local.children != null || local.description != null;

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    invokeEventHandler(local.onChange, event);
    if (event.defaultPrevented) return;

    if (event.currentTarget.checked && group && value() !== undefined) {
      group.selectValue(value() as string, event);
    }
  };

  return (
    <label
      {...{ class: twMerge(CLASSES.base, isDisabled() && CLASSES.flag.disabled, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="radio"
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        type="radio"
        value={local.value}
        name={name()}
        checked={isGrouped() ? isSelected() : local.checked}
        disabled={isDisabled()}
        {...{ class: CLASSES.slot.input }}
        data-slot="radio-input"
        aria-invalid={ariaInvalid()}
        onChange={handleChange}
      />

      <span {...{ class: CLASSES.slot.control }} data-slot="radio-control" aria-hidden="true">
        <span {...{ class: CLASSES.slot.indicator }} data-slot="radio-indicator">
          {local.indicator}
        </span>
      </span>

      <Show when={hasContent()}>
        <span {...{ class: CLASSES.slot.content }} data-slot="radio-content">
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

export default Radio;
