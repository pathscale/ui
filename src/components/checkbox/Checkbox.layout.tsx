import "./Checkbox.css";
import type { JSX } from "@solidjs/web";
import {Show, createSignal, createTrackedEffect, omit, useContext, type Component} from "solid-js";
import { twMerge } from "../../lib/twMerge";
import { CheckboxGroupContext } from "../checkbox-group/context";
import type { UIBaseProps, State, Issue } from "../vocabulary";
import { CLASSES } from "./Checkbox.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Checkbox.recipe";
import { resolveState } from "../vocabulary";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type CheckboxVariant = "primary" | "secondary";

export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> &
  UIBaseProps & {
    defaultChecked?: boolean;
    children?: JSX.Element;
    description?: JSX.Element;
    state?: State;
    issues?: Issue[];
    isIndeterminate?: boolean;
    indeterminate?: boolean;
    variant?: CheckboxVariant;
  };

const Checkbox: Layout<typeof componentRecipe, CheckboxProps> = () => {
  let inputRef: HTMLInputElement | undefined;
  const group = useContext(CheckboxGroupContext);

  const others = omit(
    props,
    "class",
    "children",
    "description",
    "state",
    "issues",
    "isIndeterminate",
    "indeterminate",
    "variant",
    "checked",
    "defaultChecked",
    "value",
    "name",
    "disabled",
    "onChange",
    "dataTheme",
    "aria-invalid",
  );

  const [internalSelected, setInternalSelected] = createSignal(Boolean(props.defaultChecked));

  const isControlled = () => props.checked !== undefined;
  const optionValue = () => (props.value != null ? String(props.value) : undefined);
  const isGrouped = () => Boolean(group && optionValue() !== undefined);
  const isSelected = () =>
    isGrouped()
      ? Boolean(group?.value().includes(optionValue() as string))
      : isControlled()
      ? Boolean(props.checked)
      : internalSelected();
  const isDisabled = () =>
    Boolean((props.state === "disabled")) || Boolean(props.disabled) || Boolean(group?.isDisabled());
  const isInvalid = () =>
    Boolean((resolveState(props.state, props.issues) === "invalid")) || Boolean(local["aria-invalid"]) || Boolean(group?.isInvalid());
  const isIndeterminate = () => Boolean(props.isIndeterminate) || Boolean(props.indeterminate);
  const variant = () => props.variant ?? group?.variant() ?? "primary";
  const name = () => props.name ?? group?.name();
  const hasContent = () => props.children != null || props.description != null;

  createTrackedEffect(() => {
    if (!inputRef) return;
    inputRef.indeterminate = isIndeterminate();
  });

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    invokeEventHandler(props.onChange, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    if (group && optionValue() !== undefined) {
      group.toggleValue(optionValue() as string, event.currentTarget.checked, event);
      return;
    }

    if (!isControlled()) {
      setInternalSelected(event.currentTarget.checked);
    }
  };

  return (
    <label
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        isDisabled() && CLASSES.flag.disabled,
        props.class,
      ) }}
      data-theme={props.dataTheme}
      data-slot="checkbox"
      data-selected={isSelected() ? "true" : "false"}
      data-indeterminate={isIndeterminate() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
      data-has-description={props.description != null ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        ref={(el) => {
          inputRef = el;
        }}
        type="checkbox"
        {...{ class: CLASSES.slot.input }}
        data-slot="checkbox-input"
        value={props.value}
        name={name()}
        checked={isSelected()}
        disabled={isDisabled()}
        aria-invalid={props["aria-invalid"] ?? (isInvalid() ? "true" : undefined)}
        aria-checked={isIndeterminate() ? "mixed" : undefined}
        onChange={handleChange}
      />

      <span {...{ class: CLASSES.slot.control }} data-slot="checkbox-control" aria-hidden="true">
        <span {...{ class: CLASSES.slot.indicator }} data-slot="checkbox-indicator">
          <Show
            when={isIndeterminate()}
            fallback={
              <svg
                aria-hidden="true"
                data-slot="checkbox-default-indicator--checkmark"
                fill="none"
                role="presentation"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 17 18"
              >
                <polyline points="1 9 7 14 15 4" />
              </svg>
            }
          >
            <svg
              aria-hidden="true"
              data-slot="checkbox-default-indicator--indeterminate"
              fill="none"
              role="presentation"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <line x1="21" x2="3" y1="12" y2="12" />
            </svg>
          </Show>
        </span>
      </span>

      <Show when={hasContent()}>
        <span {...{ class: CLASSES.slot.content }} data-slot="checkbox-content">
          <Show when={props.children}>
            <span data-slot="label">{props.children}</span>
          </Show>
          <Show when={props.description}>
            <span {...{ class: CLASSES.slot.description }} data-slot="description">
              {props.description}
            </span>
          </Show>
        </span>
      </Show>
    </label>
  );
};

export default Checkbox;
