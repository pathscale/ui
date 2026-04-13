import "./ComboBox.css";
import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ComboBox.classes";

export type ComboBoxVariant = "primary" | "secondary";
export type ComboBoxMenuTrigger = "focus" | "input" | "manual";
export type ComboBoxKey = string | number;

export type ComboBoxItem = {
  id?: ComboBoxKey;
  key?: ComboBoxKey;
  label?: string;
  textValue?: string;
  disabled?: boolean;
};

type NormalizedComboBoxItem<T> = {
  key: string;
  textValue: string;
  disabled: boolean;
  item: T;
};

type ComboBoxFocusTarget = "first" | "last" | "selected";

type ComboBoxContextValue = {
  variant: Accessor<ComboBoxVariant>;
  fullWidth: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isRequired: Accessor<boolean>;
  isOpen: Accessor<boolean>;
  inputValue: Accessor<string>;
  selectedKey: Accessor<string | null>;
  selectedTextValue: Accessor<string | undefined>;
  activeKey: Accessor<string | null>;
  filteredItems: Accessor<NormalizedComboBoxItem<unknown>[]>;
  listBoxId: string;
  menuTrigger: Accessor<ComboBoxMenuTrigger>;
  setOpen: (next: boolean, options?: { focusInput?: boolean }) => void;
  toggleOpen: () => void;
  setSelectedKey: (key: string | null) => void;
  setInputValue: (nextValue: string) => void;
  setActiveKey: (key: string | null) => void;
  selectKey: (key: string) => void;
  focusNext: (direction: 1 | -1) => void;
  focusBoundary: (target: ComboBoxFocusTarget) => void;
  getOptionId: (key: string) => string;
  attachInputRef: (node: HTMLInputElement) => void;
};

const ComboBoxContext = createContext<ComboBoxContextValue>();

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const normalizeKey = (key: ComboBoxKey | null | undefined) =>
  key == null ? null : String(key);

const toOptionKey = (key: string, index: number) => {
  const safeKey = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeKey.length > 0 ? safeKey : `option-${index}`;
};

const defaultFilter = (textValue: string, inputValue: string) => {
  if (inputValue.trim().length === 0) return true;
  return textValue.toLowerCase().includes(inputValue.trim().toLowerCase());
};

const extractItemKey = (item: unknown, index: number): string => {
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;

    if (record.key != null) return String(record.key);
    if (record.id != null) return String(record.id);
  }

  return String(index);
};

const extractItemText = (item: unknown, fallbackKey: string): string => {
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;

    if (typeof record.textValue === "string") return record.textValue;
    if (typeof record.label === "string") return record.label;
  }

  return fallbackKey;
};

const extractItemDisabled = (item: unknown): boolean => {
  if (!item || typeof item !== "object") return false;
  return Boolean((item as Record<string, unknown>).disabled);
};

export type ComboBoxRootProps<T = ComboBoxItem> = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
    items?: readonly T[];
    selectedKey?: ComboBoxKey | null;
    defaultSelectedKey?: ComboBoxKey | null;
    onSelectionChange?: (key: string | null) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputChange?: (value: string) => void;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    fullWidth?: boolean;
    variant?: ComboBoxVariant;
    menuTrigger?: ComboBoxMenuTrigger;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    allowsCustomValue?: boolean;
    placeholder?: string;
    name?: string;
    isRequired?: boolean;
    required?: boolean;
    defaultFilter?: (textValue: string, inputValue: string) => boolean;
    itemKey?: (item: T, index: number) => ComboBoxKey;
    itemTextValue?: (item: T, index: number) => string;
    itemDisabled?: (item: T, index: number) => boolean;
  };

export type ComboBoxInputGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type ComboBoxInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "disabled"
> &
  IComponentBaseProps & {
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  };

export type ComboBoxTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled"
> &
  IComponentBaseProps & {
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

export type ComboBoxPopoverProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type ComboBoxListRenderItem = {
  key: string;
  textValue: string;
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
  item: unknown;
};

export type ComboBoxListProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element | ((item: ComboBoxListRenderItem) => JSX.Element);
    renderEmptyState?: () => JSX.Element;
    endIcon?: JSX.Element;
  };

const ComboBoxRoot: ParentComponent<ComboBoxRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "startIcon",
    "endIcon",
    "class",
    "className",
    "dataTheme",
    "style",
    "items",
    "selectedKey",
    "defaultSelectedKey",
    "onSelectionChange",
    "inputValue",
    "defaultInputValue",
    "onInputChange",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "fullWidth",
    "variant",
    "menuTrigger",
    "isDisabled",
    "disabled",
    "isInvalid",
    "allowsCustomValue",
    "placeholder",
    "name",
    "isRequired",
    "required",
    "defaultFilter",
    "itemKey",
    "itemTextValue",
    "itemDisabled",
    "onFocusOut",
    "ref",
  ]);

  const listBoxId = `${createUniqueId()}-listbox`;
  const [internalSelectedKey, setInternalSelectedKey] = createSignal<string | null>(
    normalizeKey(local.defaultSelectedKey),
  );
  const [internalInputValue, setInternalInputValue] = createSignal(local.defaultInputValue ?? "");
  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [activeKey, setActiveKeySignal] = createSignal<string | null>(null);

  let rootRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  const variant = () => local.variant ?? "primary";
  const menuTrigger = () => local.menuTrigger ?? "focus";
  const fullWidth = () => Boolean(local.fullWidth);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () => Boolean(local.isInvalid);
  const isRequired = () => Boolean(local.isRequired) || Boolean(local.required);
  const isOpen = () => (local.isOpen !== undefined ? Boolean(local.isOpen) : internalOpen());
  const selectedKey = createMemo(() =>
    local.selectedKey !== undefined ? normalizeKey(local.selectedKey) : internalSelectedKey(),
  );
  const inputValue = createMemo(() =>
    local.inputValue !== undefined ? local.inputValue : internalInputValue(),
  );

  const normalizedItems = createMemo<NormalizedComboBoxItem<unknown>[]>(() =>
    (local.items ?? []).map((item, index) => {
      const baseKey =
        local.itemKey != null
          ? String(local.itemKey(item, index))
          : extractItemKey(item, index);

      const textValue =
        local.itemTextValue != null
          ? local.itemTextValue(item, index)
          : extractItemText(item, baseKey);

      const disabled =
        local.itemDisabled != null ? Boolean(local.itemDisabled(item, index)) : extractItemDisabled(item);

      return {
        key: baseKey,
        textValue,
        disabled,
        item,
      };
    }),
  );

  const selectedItem = createMemo(() => {
    const key = selectedKey();
    if (!key) return undefined;
    return normalizedItems().find((item) => item.key === key);
  });

  const filteredItems = createMemo(() => {
    const query = inputValue();
    const filter = local.defaultFilter ?? defaultFilter;

    return normalizedItems().filter((item) => filter(item.textValue, query));
  });

  const getEnabledItems = () => filteredItems().filter((item) => !item.disabled);

  const setSelectedKey = (nextKey: string | null) => {
    if (local.selectedKey === undefined) {
      setInternalSelectedKey(nextKey);
    }

    local.onSelectionChange?.(nextKey);
  };

  const setInputValue = (nextValue: string) => {
    if (local.inputValue === undefined) {
      setInternalInputValue(nextValue);
    }

    local.onInputChange?.(nextValue);
  };

  const setOpen = (next: boolean, options?: { focusInput?: boolean }) => {
    if (next && isDisabled()) return;

    if (local.isOpen === undefined) {
      setInternalOpen(next);
    }

    local.onOpenChange?.(next);

    if (!next && options?.focusInput) {
      queueMicrotask(() => {
        inputRef?.focus();
      });
    }
  };

  const focusBoundary = (target: ComboBoxFocusTarget) => {
    const enabledItems = getEnabledItems();
    if (!enabledItems.length) {
      setActiveKeySignal(null);
      return;
    }

    if (target === "selected") {
      const selected = enabledItems.find((item) => item.key === selectedKey());
      setActiveKeySignal((selected ?? enabledItems[0]).key);
      return;
    }

    setActiveKeySignal(target === "first" ? enabledItems[0].key : enabledItems[enabledItems.length - 1].key);
  };

  const focusNext = (direction: 1 | -1) => {
    const enabledItems = getEnabledItems();
    if (!enabledItems.length) {
      setActiveKeySignal(null);
      return;
    }

    const current = activeKey();
    const currentIndex = enabledItems.findIndex((item) => item.key === current);

    if (currentIndex < 0) {
      focusBoundary(direction === 1 ? "first" : "last");
      return;
    }

    const nextIndex = (currentIndex + direction + enabledItems.length) % enabledItems.length;
    setActiveKeySignal(enabledItems[nextIndex].key);
  };

  const selectKey = (key: string) => {
    const item = normalizedItems().find((entry) => entry.key === key);
    if (!item || item.disabled || isDisabled()) return;

    setSelectedKey(item.key);
    setInputValue(item.textValue);
    setActiveKeySignal(item.key);
    setOpen(false, { focusInput: true });
  };

  const closeAndCommit = () => {
    setOpen(false);
    setActiveKeySignal(null);

    if (!local.allowsCustomValue) {
      const selected = selectedItem();
      setInputValue(selected?.textValue ?? "");
    }
  };

  const handleFocusOut: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocusOut, event);

    if (event.defaultPrevented) return;

    const nextTarget = event.relatedTarget as Node | null;

    if (rootRef?.contains(nextTarget)) return;

    closeAndCommit();
  };

  const getOptionId = (key: string) => `${listBoxId}-${toOptionKey(key, 0)}`;

  createEffect(() => {
    if (local.inputValue !== undefined) return;

    const selected = selectedItem();
    if (!selected) return;

    if (internalInputValue() !== selected.textValue) {
      setInternalInputValue(selected.textValue);
    }
  });

  createEffect(() => {
    if (!isOpen()) return;

    const enabledItems = getEnabledItems();

    if (!enabledItems.length) {
      setActiveKeySignal(null);
      return;
    }

    const currentKey = activeKey();

    if (currentKey && enabledItems.some((item) => item.key === currentKey)) return;

    const selected = enabledItems.find((item) => item.key === selectedKey());
    setActiveKeySignal((selected ?? enabledItems[0]).key);
  });

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef) return;
      if (rootRef.contains(event.target as Node)) return;
      closeAndCommit();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
    });
  });

  const hiddenValue = createMemo(() => {
    const currentKey = selectedKey();

    if (currentKey) return currentKey;
    if (local.allowsCustomValue) return inputValue();

    return "";
  });

  return (
    <ComboBoxContext.Provider
      value={{
        variant,
        fullWidth,
        isDisabled,
        isInvalid,
        isRequired,
        isOpen,
        inputValue,
        selectedKey,
        selectedTextValue: () => selectedItem()?.textValue,
        activeKey,
        filteredItems,
        listBoxId,
        menuTrigger,
        setOpen,
        toggleOpen: () => setOpen(!isOpen()),
        setSelectedKey,
        setInputValue,
        setActiveKey: setActiveKeySignal,
        selectKey,
        focusNext,
        focusBoundary,
        getOptionId,
        attachInputRef: (node) => {
          inputRef = node;
        },
      }}
    >
      <div
        {...others}
        ref={(node) => {
          rootRef = node;
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          fullWidth() && CLASSES.Root.flag.fullWidth,
          local.class,
          local.className,
        ) }}
        data-slot="combobox"
        data-open={isOpen() ? "true" : "false"}
        data-invalid={isInvalid() ? "true" : undefined}
        data-disabled={isDisabled() ? "true" : undefined}
        aria-invalid={isInvalid() ? "true" : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-theme={local.dataTheme}
        style={local.style}
        onFocusOut={handleFocusOut}
      >
        <Show when={local.name}>
          <input name={local.name} type="hidden" value={hiddenValue()} />
        </Show>

        {local.children ?? (
          <>
            <ComboBoxInputGroup>
              <Show when={local.startIcon}>
                <span
                  {...{ class: twMerge(CLASSES.Icon.base, CLASSES.Icon.start) }}
                  data-slot="combobox-start-icon"
                >
                  {local.startIcon}
                </span>
              </Show>
              <ComboBoxInput placeholder={local.placeholder} required={isRequired()} />
              <ComboBoxTrigger endIcon={local.endIcon} />
            </ComboBoxInputGroup>
            <ComboBoxPopover>
              <ComboBoxList />
            </ComboBoxPopover>
          </>
        )}
      </div>
    </ComboBoxContext.Provider>
  );
};

const ComboBoxInputGroup: ParentComponent<ComboBoxInputGroupProps> = (props) => {
  const context = useContext(ComboBoxContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(
        CLASSES.InputGroup.base,
        context?.fullWidth() && CLASSES.InputGroup.flag.fullWidth,
        local.class,
        local.className,
      ) }}
      data-slot="combobox-input-group"
      data-disabled={context?.isDisabled() ? "true" : undefined}
      data-invalid={context?.isInvalid() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const ComboBoxInput: Component<ComboBoxInputProps> = (props) => {
  const context = useContext(ComboBoxContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "onInput",
    "onKeyDown",
    "onFocus",
    "onBlur",
    "ref",
    "required",
  ]);

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    invokeEventHandler(local.onInput, event);
    if (event.defaultPrevented) return;

    const nextValue = event.currentTarget.value;
    context?.setInputValue(nextValue);
    const selectedTextValue = context?.selectedTextValue();

    if (context?.selectedKey() != null && selectedTextValue !== nextValue) {
      context?.setSelectedKey(null);
    }

    if ((context?.menuTrigger() ?? "focus") !== "manual") {
      context?.setOpen(true);
    }
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocus, event);
    if (event.defaultPrevented) return;

    if ((context?.menuTrigger() ?? "focus") === "focus") {
      context?.setOpen(true);
    }
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;

    const isOpen = context?.isOpen() ?? false;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        context?.setOpen(true);
        context?.focusBoundary("selected");
        return;
      }
      context?.focusNext(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        context?.setOpen(true);
        context?.focusBoundary("selected");
        return;
      }
      context?.focusNext(-1);
      return;
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      context?.focusBoundary("first");
      return;
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      context?.focusBoundary("last");
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      context?.setOpen(false);
      return;
    }

    if (event.key === "Enter" && isOpen) {
      const key = context?.activeKey();
      if (!key) return;

      event.preventDefault();
      context?.selectKey(key);
      return;
    }

    if (event.key === "Tab") {
      context?.setOpen(false);
    }
  };

  const activeOptionId = () => {
    const activeKey = context?.activeKey();
    if (!context?.isOpen() || !activeKey) return undefined;
    return context.getOptionId(activeKey);
  };

  return (
    <input
      {...others}
      ref={(node) => {
        context?.attachInputRef(node);
        if (typeof local.ref === "function") {
          local.ref(node);
        }
      }}
      role="combobox"
      aria-haspopup="listbox"
      aria-controls={context?.listBoxId}
      aria-expanded={context?.isOpen() ? "true" : "false"}
      aria-autocomplete="list"
      aria-activedescendant={activeOptionId()}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      aria-invalid={context?.isInvalid() ? "true" : undefined}
      {...{ class: twMerge(CLASSES.Input.base, local.class, local.className) }}
      data-slot="combobox-input"
      data-theme={local.dataTheme}
      style={local.style}
      value={context?.inputValue() ?? ""}
      disabled={context?.isDisabled()}
      required={local.required ?? context?.isRequired()}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={(event) => invokeEventHandler(local.onBlur, event)}
      onKeyDown={handleKeyDown}
    />
  );
};

const ComboBoxTrigger: Component<ComboBoxTriggerProps> = (props) => {
  const context = useContext(ComboBoxContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "startIcon",
    "endIcon",
    "onClick",
  ]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    context?.toggleOpen();
  };

  return (
    <button
      {...others}
      type="button"
      {...{ class: twMerge(CLASSES.Trigger.base, local.class, local.className) }}
      data-slot="combobox-trigger"
      data-open={context?.isOpen() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      disabled={context?.isDisabled()}
      aria-disabled={context?.isDisabled() ? "true" : undefined}
      aria-haspopup="listbox"
      aria-expanded={context?.isOpen() ? "true" : "false"}
      aria-controls={context?.listBoxId}
      aria-label="Toggle options"
      onClick={handleClick}
    >
      {local.startIcon ? (
        <span
          {...{ class: twMerge(CLASSES.Icon.base, CLASSES.Icon.start) }}
          data-slot="combobox-trigger-start-icon"
        >
          {local.startIcon}
        </span>
      ) : null}
      {local.children}
      {local.endIcon ? (
        <span
          {...{ class: twMerge(CLASSES.Icon.base, CLASSES.Icon.end, CLASSES.Trigger.icon) }}
          data-slot="combobox-trigger-end-icon"
        >
          {local.endIcon}
        </span>
      ) : null}
    </button>
  );
};

const ComboBoxPopover: ParentComponent<ComboBoxPopoverProps> = (props) => {
  const context = useContext(ComboBoxContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Popover.base, local.class, local.className) }}
      data-slot="combobox-popover"
      data-open={context?.isOpen() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children ?? <ComboBoxList />}
    </div>
  );
};

const ComboBoxList: Component<ComboBoxListProps> = (props) => {
  const context = useContext(ComboBoxContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "renderEmptyState",
    "endIcon",
  ]);

  const items = () => context?.filteredItems() ?? [];

  return (
    <div
      {...others}
      id={context?.listBoxId}
      role="listbox"
      {...{ class: twMerge(CLASSES.List.base, local.class, local.className) }}
      data-slot="combobox-list"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show
        when={items().length > 0}
        fallback={
          local.renderEmptyState?.() ?? (
            <div {...{ class: CLASSES.List.empty }} data-slot="combobox-empty-state">
              No matching options
            </div>
          )
        }
      >
        <For each={items()}>
          {(item) => {
            const selected = () => context?.selectedKey() === item.key;
            const active = () => context?.activeKey() === item.key;
            const state: ComboBoxListRenderItem = {
              key: item.key,
              textValue: item.textValue,
              isSelected: selected(),
              isActive: active(),
              isDisabled: item.disabled,
              item: item.item,
            };

            return (
              <div
                id={context?.getOptionId(item.key)}
                role="option"
                tabindex={-1}
                aria-selected={selected() ? "true" : "false"}
                aria-disabled={item.disabled ? "true" : undefined}
                data-slot="combobox-option"
                data-key={item.key}
                data-selected={selected() ? "true" : "false"}
                data-active={active() ? "true" : "false"}
                data-disabled={item.disabled ? "true" : "false"}
                {...{ class: CLASSES.Option.base }}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => {
                  if (item.disabled) return;
                  context?.setActiveKey(item.key);
                }}
                onClick={() => {
                  if (item.disabled) return;
                  context?.selectKey(item.key);
                }}
              >
                <span {...{ class: CLASSES.Option.label }}>
                  {typeof local.children === "function" ? local.children(state) : item.textValue}
                </span>
                {local.endIcon ? (
                  <span {...{ class: CLASSES.Option.indicator }} aria-hidden="true">
                    <span
                      {...{ class: twMerge(CLASSES.Icon.base, CLASSES.Icon.end) }}
                      data-slot="combobox-option-end-icon"
                    >
                      {local.endIcon}
                    </span>
                  </span>
                ) : null}
              </div>
            );
          }}
        </For>
      </Show>
    </div>
  );
};

const ComboBox = Object.assign(ComboBoxRoot, {
  Root: ComboBoxRoot,
  InputGroup: ComboBoxInputGroup,
  Input: ComboBoxInput,
  Trigger: ComboBoxTrigger,
  Popover: ComboBoxPopover,
  List: ComboBoxList,
});

export default ComboBox;
export {
  ComboBox,
  ComboBoxRoot,
  ComboBoxInputGroup,
  ComboBoxInput,
  ComboBoxTrigger,
  ComboBoxPopover,
  ComboBoxList,
};
export type { ComboBoxRootProps as ComboBoxProps };
