import "./Checkbox.css";
import { Show, createEffect, createSignal, splitProps, type Component, type JSX } from "solid-js";
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

export type CheckboxVariant = "primary" | "secondary";

const VARIANT_CLASS_MAP: Record<CheckboxVariant, string> = {
  primary: "checkbox--primary",
  secondary: "checkbox--secondary",
};

export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> &
  IComponentBaseProps & {
    defaultChecked?: boolean;
    children?: JSX.Element;
    description?: JSX.Element;
    isDisabled?: boolean;
    isInvalid?: boolean;
    isIndeterminate?: boolean;
    indeterminate?: boolean;
    variant?: CheckboxVariant;
  };

const Checkbox: Component<CheckboxProps> = (props) => {
  let inputRef: HTMLInputElement | undefined;

  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "description",
    "isDisabled",
    "isInvalid",
    "isIndeterminate",
    "indeterminate",
    "variant",
    "checked",
    "defaultChecked",
    "disabled",
    "onChange",
    "dataTheme",
    "aria-invalid",
  ]);

  const [internalSelected, setInternalSelected] = createSignal(Boolean(local.defaultChecked));

  const isControlled = () => local.checked !== undefined;
  const isSelected = () => (isControlled() ? Boolean(local.checked) : internalSelected());
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid) || Boolean(local["aria-invalid"]);
  const isIndeterminate = () => Boolean(local.isIndeterminate) || Boolean(local.indeterminate);
  const variant = () => local.variant ?? "primary";
  const hasContent = () => local.children != null || local.description != null;

  createEffect(() => {
    if (!inputRef) return;
    inputRef.indeterminate = isIndeterminate();
  });

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
        "checkbox",
        VARIANT_CLASS_MAP[variant()],
        isDisabled() && "checkbox--disabled",
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="checkbox"
      data-selected={isSelected() ? "true" : "false"}
      data-indeterminate={isIndeterminate() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
      data-has-description={local.description != null ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <input
        {...others}
        ref={(el) => {
          inputRef = el;
        }}
        type="checkbox"
        class="checkbox__input"
        data-slot="checkbox-input"
        checked={isSelected()}
        disabled={isDisabled()}
        aria-invalid={local["aria-invalid"] ?? (isInvalid() ? true : undefined)}
        aria-checked={isIndeterminate() ? "mixed" : undefined}
        onChange={handleChange}
      />

      <span class="checkbox__control" data-slot="checkbox-control" aria-hidden="true">
        <span class="checkbox__indicator" data-slot="checkbox-indicator">
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
        <span class="checkbox__content" data-slot="checkbox-content">
          <Show when={local.children}>
            <span data-slot="label">{local.children}</span>
          </Show>
          <Show when={local.description}>
            <span class="checkbox__description" data-slot="description">
              {local.description}
            </span>
          </Show>
        </span>
      </Show>
    </label>
  );
};

export default Checkbox;
