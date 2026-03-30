import { type JSX, For, createMemo, createSignal, createUniqueId, createEffect, splitProps, useContext } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import Dropdown from "../dropdown/Dropdown";
import { DropdownContext } from "../dropdown/Dropdown";
import type { ComponentSize, IComponentBaseProps } from "../types";

export type DropdownSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type DropdownSelectProps = IComponentBaseProps & {
  options: DropdownSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showCheckmark?: boolean;
  size?: ComponentSize;
  "aria-label"?: string;
  labelRenderer?: (value: string, option?: DropdownSelectOption) => JSX.Element;
  optionRenderer?: (option: DropdownSelectOption, selected: boolean, highlighted: boolean) => JSX.Element;
};

const sizeClasses: Record<ComponentSize, string> = {
  xs: "btn-xs text-xs",
  sm: "btn-sm text-sm",
  md: "btn-md text-base",
  lg: "btn-lg text-lg",
  xl: "btn-xl text-xl",
};

/** Inner component that has access to the Dropdown context for open/close control. */
const DropdownSelectInner = (props: {
  options: DropdownSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  showCheckmark: boolean;
  size: ComponentSize;
  disabled?: boolean;
  labelRenderer?: (value: string, option?: DropdownSelectOption) => JSX.Element;
  optionRenderer?: (option: DropdownSelectOption, selected: boolean, highlighted: boolean) => JSX.Element;
}) => {
  const dropdownCtx = useContext(DropdownContext);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  const listboxId = createUniqueId();
  let typeaheadBuffer = "";
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  const getOptionId = (index: number) => `${listboxId}-option-${index}`;

  const selectedLabel = createMemo(() => {
    const opt = props.options.find((o) => o.value === props.value);
    return opt ? opt.label : props.placeholder;
  });

  const isOpen = () => dropdownCtx?.open() ?? false;

  // Find next non-disabled index in a given direction
  const findNextEnabledIndex = (from: number, direction: 1 | -1): number => {
    const len = props.options.length;
    if (len === 0) return -1;
    let idx = from;
    for (let i = 0; i < len; i++) {
      idx = ((idx + direction) % len + len) % len;
      if (!props.options[idx].disabled) return idx;
    }
    return -1;
  };

  const findFirstEnabledIndex = (): number => {
    return props.options.findIndex((o) => !o.disabled);
  };

  const findLastEnabledIndex = (): number => {
    for (let i = props.options.length - 1; i >= 0; i--) {
      if (!props.options[i].disabled) return i;
    }
    return -1;
  };

  const selectOption = (index: number) => {
    if (index >= 0 && index < props.options.length && !props.options[index].disabled) {
      props.onChange?.(props.options[index].value);
      dropdownCtx?.setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const openMenu = () => {
    if (!isOpen()) {
      dropdownCtx?.setOpen(true);
      // Highlight the currently selected option, or first enabled
      const currentIdx = props.options.findIndex((o) => o.value === props.value);
      setHighlightedIndex(currentIdx >= 0 ? currentIdx : findFirstEnabledIndex());
    }
  };

  const handleTypeahead = (char: string) => {
    if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer);
    typeaheadBuffer += char.toLowerCase();
    typeaheadTimer = setTimeout(() => {
      typeaheadBuffer = "";
      typeaheadTimer = undefined;
    }, 500);
    const matchIndex = props.options.findIndex(
      (o) => !o.disabled && o.label.toLowerCase().startsWith(typeaheadBuffer),
    );
    if (matchIndex >= 0) {
      setHighlightedIndex(matchIndex);
    }
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLLabelElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    if (!isOpen()) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openMenu();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openMenu();
        handleTypeahead(e.key);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        dropdownCtx?.setOpen(false);
        setHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => findNextEnabledIndex(prev, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => findNextEnabledIndex(prev, -1));
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(findFirstEnabledIndex());
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(findLastEnabledIndex());
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        e.stopPropagation();
        if (highlightedIndex() >= 0) {
          selectOption(highlightedIndex());
        }
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleTypeahead(e.key);
        }
        break;
    }
  };

  // Scroll highlighted option into view
  createEffect(() => {
    if (isOpen() && highlightedIndex() >= 0) {
      const el = document.getElementById(getOptionId(highlightedIndex()));
      el?.scrollIntoView({ block: "nearest" });
    }
  });

  // Reset highlight when menu closes
  createEffect(() => {
    if (!isOpen()) {
      setHighlightedIndex(-1);
    }
  });

  return (
    <>
      <Dropdown.Toggle
        class={twMerge(
          "btn gap-2 justify-between",
          sizeClasses[props.size],
          clsx({ "btn-disabled": props.disabled }),
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen()}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen() && highlightedIndex() >= 0
            ? getOptionId(highlightedIndex())
            : undefined
        }
        onKeyDown={handleKeyDown}
      >
        <span class="truncate">
          {props.labelRenderer
            ? props.labelRenderer(
                selectedLabel(),
                props.options.find((o) => o.value === props.value),
              )
            : selectedLabel()}
        </span>
        {/* Chevron down icon */}
        <svg
          class="h-4 w-4 shrink-0 opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </Dropdown.Toggle>
      <Dropdown.Menu id={listboxId} class="z-10" role="listbox">
        <For each={props.options}>
          {(option, index) => (
            <Dropdown.Item
              id={getOptionId(index())}
              role="option"
              disabled={option.disabled}
              class={clsx({
                "bg-primary/10": props.value === option.value,
                "bg-base-300": highlightedIndex() === index() && props.value !== option.value,
                "bg-primary/20": highlightedIndex() === index() && props.value === option.value,
              })}
              onClick={() => {
                props.onChange?.(option.value);
                setHighlightedIndex(-1);
              }}
              onMouseEnter={() => setHighlightedIndex(index())}
              aria-selected={props.value === option.value}
            >
              {props.optionRenderer
                ? props.optionRenderer(
                    option,
                    props.value === option.value,
                    highlightedIndex() === index(),
                  )
                : (
                  <span class="flex items-center gap-2 w-full">
                    {props.showCheckmark && (
                      <svg
                        class={clsx("h-4 w-4 shrink-0", {
                          "opacity-100": props.value === option.value,
                          "opacity-0": props.value !== option.value,
                        })}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    )}
                    <span class="truncate">{option.label}</span>
                  </span>
                )}
            </Dropdown.Item>
          )}
        </For>
      </Dropdown.Menu>
    </>
  );
};

const DropdownSelect = (props: DropdownSelectProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "options",
    "value",
    "onChange",
    "label",
    "placeholder",
    "disabled",
    "showCheckmark",
    "size",
    "aria-label",
    "class",
    "className",
    "dataTheme",
    "style",
    "labelRenderer",
    "optionRenderer",
  ]);

  const placeholder = () => local.placeholder ?? "Select...";
  const showCheckmark = () => local.showCheckmark ?? true;
  const size = () => local.size ?? "md";

  return (
    <Dropdown
      {...others}
      role="none"
      class={twMerge(local.class, local.className)}
      style={local.style}
      dataTheme={local.dataTheme}
      aria-label={local["aria-label"] ?? local.label}
    >
      <DropdownSelectInner
        options={local.options}
        value={local.value}
        onChange={local.onChange}
        placeholder={placeholder()}
        showCheckmark={showCheckmark()}
        size={size()}
        disabled={local.disabled}
        labelRenderer={local.labelRenderer}
        optionRenderer={local.optionRenderer}
      />
    </Dropdown>
  );
};

export default DropdownSelect;
