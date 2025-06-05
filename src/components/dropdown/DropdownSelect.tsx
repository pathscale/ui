import {
  type JSX,
  createSignal,
  createEffect,
  For,
  Show,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";
import { useDropdown } from "./useDropdown";
import DropdownItem from "./DropdownItem";

export type DropdownSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type DropdownSelectProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    options: DropdownSelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    horizontal?: "left" | "right";
    vertical?: "top" | "bottom";
    end?: boolean;
    color?: ComponentColor;
    size?: ComponentSize;
    disabled?: boolean;
    error?: boolean;
    class?: string;
    className?: string;
  };

const DropdownSelect = (props: DropdownSelectProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "options",
    "value",
    "onChange",
    "placeholder",
    "horizontal",
    "vertical",
    "end",
    "color",
    "size",
    "disabled",
    "error",
    "class",
    "className",
    "dataTheme",
  ]);

  const [selectedValue, setSelectedValue] = createSignal(local.value || "");
  const [selectedLabel, setSelectedLabel] = createSignal("");

  createEffect(() => {
    if (local.value !== undefined) {
      setSelectedValue(local.value);
    }
  });

  createEffect(() => {
    const option = local.options.find((opt) => opt.value === selectedValue());
    setSelectedLabel(option?.label || local.placeholder || "Select an option");
  });

  const dropdown = useDropdown({
    trigger: "click",
    disabled: local.disabled,
  });

  const handleSelect = (option: DropdownSelectOption) => {
    if (option.disabled) return;

    setSelectedValue(option.value);
    dropdown.setOpen(false);
    local.onChange?.(option.value);
  };

  const classes = () =>
    twMerge(
      "dropdown",
      local.class,
      local.className,
      clsx({
        "dropdown-left": local.horizontal === "left",
        "dropdown-right": local.horizontal === "right",
        "dropdown-top": local.vertical === "top",
        "dropdown-bottom": local.vertical === "bottom",
        "dropdown-end": local.end,
        "dropdown-primary": local.color === "primary",
        "dropdown-secondary": local.color === "secondary",
        "dropdown-accent": local.color === "accent",
        "dropdown-info": local.color === "info",
        "dropdown-success": local.color === "success",
        "dropdown-warning": local.color === "warning",
        "dropdown-error": local.error || local.color === "error",
        "dropdown-xl": local.size === "xl",
        "dropdown-lg": local.size === "lg",
        "dropdown-md": local.size === "md",
        "dropdown-sm": local.size === "sm",
        "dropdown-xs": local.size === "xs",
      })
    );

  return (
    <div
      {...others}
      ref={dropdown.ref}
      data-theme={local.dataTheme}
      class={classes()}
      aria-disabled={local.disabled}
      onKeyDown={dropdown.onKeyDown}
    >
      <button
        tabIndex={local.disabled ? -1 : 0}
        role="combobox"
        aria-expanded={dropdown.open()}
        aria-haspopup="listbox"
        class={twMerge(
          "select w-full",
          clsx({
            "select-primary": local.color === "primary",
            "select-secondary": local.color === "secondary",
            "select-accent": local.color === "accent",
            "select-info": local.color === "info",
            "select-success": local.color === "success",
            "select-warning": local.color === "warning",
            "select-error": local.error || local.color === "error",
            "select-xl": local.size === "xl",
            "select-lg": local.size === "lg",
            "select-md": local.size === "md",
            "select-sm": local.size === "sm",
            "select-xs": local.size === "xs",
            "select-disabled": local.disabled,
          })
        )}
        onClick={() => dropdown.toggle()}
        disabled={local.disabled}
      >
        {selectedLabel()}
      </button>
      <Show when={dropdown.open()}>
        <ul
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-auto"
          role="listbox"
          aria-activedescendant={`dropdown-item-${selectedValue()}`}
        >
          <For each={local.options}>
            {(option) => (
              <li>
                <button
                  id={`dropdown-item-${option.value}`}
                  role="option"
                  class={clsx({
                    active: option.value === selectedValue(),
                    "opacity-50 cursor-not-allowed": option.disabled,
                  })}
                  aria-selected={option.value === selectedValue()}
                  aria-disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                >
                  {option.label}
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};

export default DropdownSelect;
