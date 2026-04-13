import "./Select.css";
import {
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
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Select.classes";

type SelectKey = string | number;
export type SelectValueType = SelectKey | SelectKey[] | null;
export type SelectVariant = "primary" | "secondary";
export type SelectSelectionMode = "single" | "multiple";
type SelectFocusRequest = "selected" | "first" | "last" | null;

type SelectOptionRecord = {
  key: string;
  textValue: string;
  disabled: boolean;
  ref: HTMLButtonElement;
};

type SelectContextValue = {
  open: Accessor<boolean>;
  variant: Accessor<SelectVariant>;
  fullWidth: Accessor<boolean>;
  disabled: Accessor<boolean>;
  selectionMode: Accessor<SelectSelectionMode>;
  placeholder: Accessor<string>;
  triggerId: string;
  listboxId: string;
  selectedKeys: Accessor<string[]>;
  selectedText: Accessor<string>;
  focusedKey: Accessor<string | undefined>;
  isSelected: (key: string) => boolean;
  setOpen: (next: boolean, options?: { focusTrigger?: boolean }) => void;
  toggleOpen: () => void;
  setFocusedKey: (key: string | undefined) => void;
  focusBoundary: (target: "first" | "last" | "selected") => void;
  focusNext: (direction: 1 | -1) => void;
  requestFocus: (target: SelectFocusRequest) => void;
  selectKey: (key: string) => void;
  registerOption: (option: SelectOptionRecord) => void;
  unregisterOption: (key: string) => void;
  setTriggerRef: (el: HTMLButtonElement) => void;
  setRootRef: (el: HTMLDivElement) => void;
};

const SelectContext = createContext<SelectContextValue>();

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const isIterableValue = (value: unknown): value is Iterable<SelectKey> => {
  if (value == null || typeof value === "string") return false;
  return typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] === "function";
};

const normalizeSelection = (
  selectionMode: SelectSelectionMode,
  value: SelectValueType | Iterable<SelectKey> | undefined,
): string[] => {
  if (value == null) return [];

  let entries: SelectKey[];

  if (Array.isArray(value)) {
    entries = value;
  } else if (isIterableValue(value)) {
    entries = Array.from(value);
  } else {
    entries = [value];
  }

  const normalized = entries
    .map((entry) => String(entry))
    .filter((entry, index, source) => entry.length > 0 && source.indexOf(entry) === index);

  if (selectionMode === "single") {
    return normalized.slice(0, 1);
  }

  return normalized;
};

const sortOptionsByDomOrder = (options: SelectOptionRecord[]) =>
  [...options].sort((a, b) => {
    if (a.ref === b.ref) return 0;
    const relation = a.ref.compareDocumentPosition(b.ref);
    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

export type SelectRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> &
  IComponentBaseProps & {
    children: JSX.Element;
    placeholder?: string;
    value?: SelectValueType;
    defaultValue?: SelectValueType;
    selectedKeys?: Iterable<SelectKey>;
    defaultSelectedKeys?: Iterable<SelectKey>;
    onChange?: (value: string | string[] | null) => void;
    onSelectionChange?: (keys: Set<string>) => void;
    isDisabled?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    variant?: SelectVariant;
    selectionMode?: SelectSelectionMode;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  };

const SelectRoot: Component<SelectRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "placeholder",
    "value",
    "defaultValue",
    "selectedKeys",
    "defaultSelectedKeys",
    "onChange",
    "onSelectionChange",
    "isDisabled",
    "disabled",
    "fullWidth",
    "variant",
    "selectionMode",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "ref",
  ]);

  const baseId = createUniqueId();
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;

  const selectionMode = () => local.selectionMode ?? "single";
  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
  const disabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);

  const initialSelected = normalizeSelection(
    selectionMode(),
    local.defaultSelectedKeys ?? local.defaultValue,
  );
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<string[]>(initialSelected);
  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [options, setOptions] = createSignal<SelectOptionRecord[]>([]);
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>();
  const [focusRequest, setFocusRequest] = createSignal<SelectFocusRequest>(null);
  const [triggerRef, setTriggerRefSignal] = createSignal<HTMLButtonElement | undefined>();
  const [rootRef, setRootRefSignal] = createSignal<HTMLDivElement | undefined>();

  const open = () => (local.isOpen !== undefined ? Boolean(local.isOpen) : internalOpen());

  const selectedKeys = createMemo(() => {
    const controlledValue =
      local.selectedKeys !== undefined ? local.selectedKeys : local.value;
    if (controlledValue !== undefined) {
      return normalizeSelection(selectionMode(), controlledValue);
    }
    return normalizeSelection(selectionMode(), internalSelectedKeys());
  });

  const selectedSet = createMemo(() => new Set(selectedKeys()));

  const selectedText = createMemo(() => {
    if (!selectedKeys().length) return "";

    const optionMap = new Map(options().map((option) => [option.key, option.textValue]));
    return selectedKeys()
      .map((key) => optionMap.get(key) ?? key)
      .join(selectionMode() === "multiple" ? ", " : "");
  });

  const getEnabledOptions = () => options().filter((option) => !option.disabled);

  const focusOption = (option: SelectOptionRecord | undefined) => {
    if (!option) return;
    setFocusedKey(option.key);
    option.ref.focus();
  };

  const focusBoundary = (target: "first" | "last" | "selected") => {
    const enabled = getEnabledOptions();
    if (!enabled.length) return;

    if (target === "selected") {
      const selected = enabled.find((option) => selectedSet().has(option.key));
      focusOption(selected ?? enabled[0]);
      return;
    }

    focusOption(target === "first" ? enabled[0] : enabled[enabled.length - 1]);
  };

  const focusNext = (direction: 1 | -1) => {
    const enabled = getEnabledOptions();
    if (!enabled.length) return;

    const active = document.activeElement;
    let currentIndex = enabled.findIndex((option) => option.ref === active);
    if (currentIndex < 0) {
      currentIndex = enabled.findIndex((option) => option.key === focusedKey());
    }
    if (currentIndex < 0) {
      focusBoundary(direction === 1 ? "first" : "last");
      return;
    }

    const nextIndex = (currentIndex + direction + enabled.length) % enabled.length;
    focusOption(enabled[nextIndex]);
  };

  const emitSelectionChange = (nextKeys: string[]) => {
    if (local.selectedKeys === undefined && local.value === undefined) {
      setInternalSelectedKeys(nextKeys);
    }

    local.onSelectionChange?.(new Set(nextKeys));
    local.onChange?.(
      selectionMode() === "multiple" ? nextKeys : (nextKeys[0] ?? null),
    );
  };

  const setOpen = (next: boolean, options?: { focusTrigger?: boolean }) => {
    if (next && disabled()) return;

    if (local.isOpen === undefined) {
      setInternalOpen(next);
    }
    local.onOpenChange?.(next);

    if (!next) {
      setFocusRequest(null);
      if (options?.focusTrigger) {
        triggerRef()?.focus();
      }
    }
  };

  const toggleOpen = () => {
    setOpen(!open());
  };

  const selectKey = (key: string) => {
    if (disabled()) return;

    let nextKeys: string[];

    if (selectionMode() === "multiple") {
      const nextSet = new Set(selectedKeys());
      if (nextSet.has(key)) nextSet.delete(key);
      else nextSet.add(key);
      nextKeys = Array.from(nextSet);
      emitSelectionChange(nextKeys);
      setFocusedKey(key);
      return;
    }

    nextKeys = [key];
    emitSelectionChange(nextKeys);
    setFocusedKey(key);
    setOpen(false, { focusTrigger: true });
  };

  const registerOption = (option: SelectOptionRecord) => {
    setOptions((current) =>
      sortOptionsByDomOrder([
        ...current.filter((entry) => entry.key !== option.key),
        option,
      ]),
    );
  };

  const unregisterOption = (key: string) => {
    setOptions((current) => current.filter((option) => option.key !== key));
    if (focusedKey() === key) {
      setFocusedKey(undefined);
    }
  };

  const setTriggerRef = (el: HTMLButtonElement) => {
    setTriggerRefSignal(el);
  };

  const setRootRef = (el: HTMLDivElement) => {
    setRootRefSignal(el);
    if (typeof local.ref === "function") {
      local.ref(el);
    }
  };

  createEffect(() => {
    if (!open()) return;
    const request = focusRequest();
    if (!request) return;
    focusBoundary(request);
    setFocusRequest(null);
  });

  createEffect(() => {
    const currentFocused = focusedKey();
    const currentOptions = options();

    if (currentFocused && !currentOptions.some((option) => option.key === currentFocused)) {
      setFocusedKey(undefined);
      return;
    }

    if (open() && !currentFocused) {
      const selected = currentOptions.find((option) => selectedSet().has(option.key) && !option.disabled);
      setFocusedKey(selected?.key ?? currentOptions.find((option) => !option.disabled)?.key);
    }
  });

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!open()) return;
      const root = rootRef();
      if (!root) return;
      if (root.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
    });
  });

  return (
    <SelectContext.Provider
      value={{
        open,
        variant,
        fullWidth,
        disabled,
        selectionMode,
        placeholder: () => local.placeholder ?? "Select an option",
        triggerId,
        listboxId,
        selectedKeys,
        selectedText,
        focusedKey,
        isSelected: (key) => selectedSet().has(key),
        setOpen,
        toggleOpen,
        setFocusedKey,
        focusBoundary,
        focusNext,
        requestFocus: setFocusRequest,
        selectKey,
        registerOption,
        unregisterOption,
        setTriggerRef,
        setRootRef,
      }}
    >
      <div
        {...others}
        ref={setRootRef}
        class={twMerge(
          CLASSES.base,
          CLASSES.variant[variant()],
          fullWidth() && CLASSES.flag.fullWidth,
          local.class,
          local.className,
        )}
        data-theme={local.dataTheme}
        data-slot="ui-select"
        data-open={open() ? "true" : "false"}
        data-disabled={disabled() ? "true" : "false"}
        data-selection-mode={selectionMode()}
      >
        {local.children}
      </div>
    </SelectContext.Provider>
  );
};

export type SelectTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> &
  IComponentBaseProps & {
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const SelectTrigger: Component<SelectTriggerProps> = (props) => {
  const ctx = useContext(SelectContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "disabled",
    "startIcon",
    "endIcon",
    "onClick",
    "onKeyDown",
    "ref",
    "type",
  ]);

  if (!ctx) {
    return (
      <button
        {...others}
        class={twMerge(CLASSES.slot.trigger, local.class, local.className)}
        data-theme={local.dataTheme}
        type={local.type ?? "button"}
      >
        {local.startIcon ? (
          <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)} data-slot="ui-select-trigger-start-icon">
            {local.startIcon}
          </span>
        ) : null}
        {local.children}
        {local.endIcon ? (
          <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)} data-slot="ui-select-trigger-end-icon">
            {local.endIcon}
          </span>
        ) : null}
      </button>
    );
  }

  const isDisabled = () => Boolean(local.disabled) || ctx.disabled();

  const setRef = (el: HTMLButtonElement) => {
    ctx.setTriggerRef(el);
    if (typeof local.ref === "function") {
      local.ref(el);
    }
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.toggleOpen();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!ctx.open()) {
        ctx.setOpen(true);
      }
      ctx.requestFocus("selected");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!ctx.open()) {
        ctx.setOpen(true);
      }
      ctx.requestFocus("last");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!ctx.open()) {
        ctx.setOpen(true);
        ctx.requestFocus("selected");
      } else {
        ctx.setOpen(false);
      }
      return;
    }

    if (event.key === "Escape" && ctx.open()) {
      event.preventDefault();
      ctx.setOpen(false);
    }
  };

  return (
    <button
      {...others}
      ref={setRef}
      id={ctx.triggerId}
      type={local.type ?? "button"}
      class={twMerge(
        CLASSES.slot.trigger,
        ctx.fullWidth() && CLASSES.slot.triggerFullWidth,
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="ui-select-trigger"
      data-open={ctx.open() ? "true" : "false"}
      aria-haspopup="listbox"
      aria-expanded={ctx.open()}
      aria-controls={ctx.listboxId}
      aria-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {local.startIcon ? (
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)} data-slot="ui-select-trigger-start-icon">
          {local.startIcon}
        </span>
      ) : null}
      {local.children}
      {local.endIcon ? (
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)} data-slot="ui-select-trigger-end-icon">
          {local.endIcon}
        </span>
      ) : null}
    </button>
  );
};

export type SelectValueProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps;

const SelectValue: Component<SelectValueProps> = (props) => {
  const ctx = useContext(SelectContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const placeholder = () => ctx?.placeholder() ?? "";
  const text = () => ctx?.selectedText() ?? "";
  const isPlaceholder = () => text().length === 0;

  return (
    <span
      {...others}
      class={twMerge(CLASSES.slot.value, local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="ui-select-value"
      data-placeholder={isPlaceholder() ? "true" : "false"}
    >
      {local.children ?? (isPlaceholder() ? placeholder() : text())}
    </span>
  );
};

export type SelectIndicatorProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const SelectIndicator: Component<SelectIndicatorProps> = (props) => {
  const ctx = useContext(SelectContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "startIcon",
    "endIcon",
  ]);

  return (
    <span
      {...others}
      class={twMerge(CLASSES.slot.indicator, local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="ui-select-indicator"
      data-open={ctx?.open() ? "true" : "false"}
      aria-hidden="true"
    >
      {local.startIcon ? (
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)} data-slot="ui-select-indicator-start-icon">
          {local.startIcon}
        </span>
      ) : null}
      {local.children}
      {local.endIcon ? (
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)} data-slot="ui-select-indicator-end-icon">
          {local.endIcon}
        </span>
      ) : null}
    </span>
  );
};

export type SelectPopoverProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const SelectPopover: Component<SelectPopoverProps> = (props) => {
  const ctx = useContext(SelectContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...others}
      class={twMerge(CLASSES.slot.popover, local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="ui-select-popover"
      data-open={ctx?.open() ? "true" : "false"}
    >
      {local.children}
    </div>
  );
};

export type SelectListboxProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const SelectListbox: Component<SelectListboxProps> = (props) => {
  const ctx = useContext(SelectContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...others}
      id={ctx?.listboxId}
      class={twMerge(CLASSES.slot.listbox, local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="ui-select-listbox"
      role="listbox"
      aria-multiselectable={ctx?.selectionMode() === "multiple" ? "true" : undefined}
      tabindex={-1}
    >
      {local.children}
    </div>
  );
};

export type SelectOptionProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "value"> &
  IComponentBaseProps & {
    value: SelectKey;
    textValue?: string;
    isDisabled?: boolean;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const SelectOption: Component<SelectOptionProps> = (props) => {
  const ctx = useContext(SelectContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "value",
    "textValue",
    "isDisabled",
    "disabled",
    "startIcon",
    "endIcon",
    "onClick",
    "onKeyDown",
    "onMouseEnter",
    "ref",
    "type",
  ]);

  if (!ctx) {
    return (
      <button
        {...others}
        class={twMerge(CLASSES.slot.option, local.class, local.className)}
        data-theme={local.dataTheme}
        type={local.type ?? "button"}
      >
        {local.startIcon ? (
          <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)} data-slot="ui-select-option-start-icon">
            {local.startIcon}
          </span>
        ) : null}
        {local.children}
        {local.endIcon ? (
          <span class={CLASSES.slot.optionIndicator} data-slot="ui-select-option-indicator" aria-hidden="true">
            <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)} data-slot="ui-select-option-end-icon">
              {local.endIcon}
            </span>
          </span>
        ) : null}
      </button>
    );
  }

  const key = () => String(local.value);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled) || ctx.disabled();
  const isSelected = () => ctx.isSelected(key());
  const isFocused = () => ctx.focusedKey() === key();
  let optionRef: HTMLButtonElement | undefined;

  const setRef = (el: HTMLButtonElement) => {
    optionRef = el;
    ctx.registerOption({
      key: key(),
      textValue:
        local.textValue ??
        (typeof local.children === "string" ? local.children : key()),
      disabled: isDisabled(),
      ref: el,
    });
    if (typeof local.ref === "function") {
      local.ref(el);
    }
  };

  createEffect(() => {
    if (!optionRef) return;
    ctx.registerOption({
      key: key(),
      textValue:
        local.textValue ??
        (typeof local.children === "string" ? local.children : key()),
      disabled: isDisabled(),
      ref: optionRef,
    });
  });

  onCleanup(() => {
    ctx.unregisterOption(key());
  });

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.selectKey(key());
  };

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onMouseEnter, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.setFocusedKey(key());
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      ctx.focusNext(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      ctx.focusNext(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      ctx.focusBoundary("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      ctx.focusBoundary("last");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ctx.selectKey(key());
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      ctx.setOpen(false, { focusTrigger: true });
      return;
    }

    if (event.key === "Tab") {
      ctx.setOpen(false);
    }
  };

  return (
    <button
      {...others}
      ref={setRef}
      type={local.type ?? "button"}
      class={twMerge(CLASSES.slot.option, local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="ui-select-option"
      data-selected={isSelected() ? "true" : "false"}
      data-focused={isFocused() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      role="option"
      aria-selected={isSelected()}
      aria-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      tabindex={-1}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={() => ctx.setFocusedKey(key())}
      onKeyDown={handleKeyDown}
    >
      {local.startIcon ? (
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)} data-slot="ui-select-option-start-icon">
          {local.startIcon}
        </span>
      ) : null}
      <span class={CLASSES.slot.optionLabel} data-slot="ui-select-option-label">
        {local.children}
      </span>
      {local.endIcon ? (
        <span class={CLASSES.slot.optionIndicator} data-slot="ui-select-option-indicator" aria-hidden="true">
          <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)} data-slot="ui-select-option-end-icon">
            {local.endIcon}
          </span>
        </span>
      ) : null}
    </button>
  );
};

export type SelectProps = SelectRootProps;

type SelectComponent = Component<SelectRootProps> & {
  Root: Component<SelectRootProps>;
  Trigger: Component<SelectTriggerProps>;
  Value: Component<SelectValueProps>;
  Indicator: Component<SelectIndicatorProps>;
  Popover: Component<SelectPopoverProps>;
  Listbox: Component<SelectListboxProps>;
  Option: Component<SelectOptionProps>;
};

const Select = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Indicator: SelectIndicator,
  Popover: SelectPopover,
  Listbox: SelectListbox,
  Option: SelectOption,
}) as SelectComponent;

export default Select;
