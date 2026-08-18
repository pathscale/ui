import "./Select.css";
import {createContext, createMemo, createSignal, createTrackedEffect, createUniqueId, onCleanup, onSettled, omit, useContext, type Accessor, type Component} from "solid-js";
import { Portal, type JSX} from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import {
  createOverlayPosition,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Select.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Select.recipe";

type SelectKey = string | number;
export type SelectValueType = SelectKey | SelectKey[] | null;
export type SelectVariant = "primary" | "secondary";
export type SelectSelectionMode = "single" | "multiple";
export type SelectPlacement = OverlayPlacement;
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
  placement: Accessor<SelectPlacement>;
  autoFlip: Accessor<boolean>;
  triggerRef: Accessor<HTMLButtonElement | undefined>;
  popoverRef: Accessor<HTMLDivElement | undefined>;
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
  setPopoverRef: (el: HTMLDivElement) => void;
  setRootRef: (el: HTMLDivElement) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

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
    .filter((entry, index, source) => source.indexOf(entry) === index);

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
  UIBaseProps & {
    children: JSX.Element;
    placeholder?: string;
    value?: SelectValueType;
    defaultValue?: SelectValueType;
    selectedKeys?: Iterable<SelectKey>;
    defaultSelectedKeys?: Iterable<SelectKey>;
    onChange?: (value: string | string[] | null) => void;
    onSelectionChange?: (keys: Set<string>) => void;
    state?: State;
    disabled?: boolean;
    fullWidth?: boolean;
    variant?: SelectVariant;
    selectionMode?: SelectSelectionMode;
    placement?: SelectPlacement;
    autoFlip?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  };

const SelectRoot: Layout<typeof componentRecipe, SelectRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "placeholder",
    "value",
    "defaultValue",
    "selectedKeys",
    "defaultSelectedKeys",
    "onChange",
    "onSelectionChange",
    "state",
    "disabled",
    "fullWidth",
    "variant",
    "selectionMode",
    "placement",
    "autoFlip",
    "open",
    "defaultOpen",
    "onOpenChange",
    "ref",
  );

  const baseId = createUniqueId();
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;

  const selectionMode = () => props.selectionMode ?? "single";
  const variant = () => props.variant ?? "primary";
  const fullWidth = () => Boolean(props.fullWidth);
  const disabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled);

  const initialSelected = normalizeSelection(
    selectionMode(),
    props.defaultSelectedKeys ?? props.defaultValue,
  );
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<string[]>(initialSelected);
  const [internalOpen, setInternalOpen] = createSignal(Boolean(props.defaultOpen));
  const [options, setOptions] = createSignal<SelectOptionRecord[]>([]);
  const [optionTextByKey, setOptionTextByKey] = createSignal(new Map<string, string>());
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>();
  const [focusRequest, setFocusRequest] = createSignal<SelectFocusRequest>(null);
  const [triggerRef, setTriggerRefSignal] = createSignal<HTMLButtonElement | undefined>();
  const [popoverRef, setPopoverRefSignal] = createSignal<HTMLDivElement | undefined>();
  const [rootRef, setRootRefSignal] = createSignal<HTMLDivElement | undefined>();

  const open = () => (props.open !== undefined ? Boolean(props.open) : internalOpen());
  const placement = () => props.placement ?? "bottom";
  const autoFlip = () => props.autoFlip ?? true;

  const selectedKeys = createMemo(() => {
    const controlledValue =
      props.selectedKeys !== undefined ? props.selectedKeys : props.value;
    if (controlledValue !== undefined) {
      return normalizeSelection(selectionMode(), controlledValue);
    }
    return normalizeSelection(selectionMode(), internalSelectedKeys());
  });

  const selectedSet = createMemo(() => new Set(selectedKeys()));

  const selectedText = createMemo(() => {
    if (!selectedKeys().length) return "";

    return selectedKeys()
      .map((key) => optionTextByKey().get(key) ?? key)
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
    if (props.selectedKeys === undefined && props.value === undefined) {
      setInternalSelectedKeys(nextKeys);
    }

    props.onSelectionChange?.(new Set(nextKeys));
    props.onChange?.(
      selectionMode() === "multiple" ? nextKeys : (nextKeys[0] ?? null),
    );
  };

  const setOpen = (next: boolean, options?: { focusTrigger?: boolean }) => {
    if (next && disabled()) return;

    if (props.open === undefined) {
      setInternalOpen(next);
    }
    props.onOpenChange?.(next);

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
    setOptionTextByKey((current) => {
      if (current.get(option.key) === option.textValue) return current;
      const next = new Map(current);
      next.set(option.key, option.textValue);
      return next;
    });
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

  const setPopoverRef = (el: HTMLDivElement) => {
    setPopoverRefSignal(el);
  };

  const setRootRef = (el: HTMLDivElement) => {
    setRootRefSignal(el);
    if (typeof props.ref === "function") {
      props.ref(el);
    }
  };

  createTrackedEffect(() => {
    if (!open()) return;
    const request = focusRequest();
    if (!request) return;
    focusBoundary(request);
    setFocusRequest(null);
  });

  createTrackedEffect(() => {
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

  onSettled(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!open()) return;
      const target = event.target as Node;
      if (rootRef()?.contains(target)) return;
      if (popoverRef()?.contains(target)) return;
      if (triggerRef()?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  });

  return (
    <SelectContext
      value={{
        open,
        variant,
        fullWidth,
        disabled,
        selectionMode,
        placeholder: () => props.placeholder ?? "Select an option",
        triggerId,
        listboxId,
        placement,
        autoFlip,
        triggerRef,
        popoverRef,
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
        setPopoverRef,
        setRootRef,
      }}
    >
      <div
        {...others}
        ref={setRootRef}
        {...{ class: twMerge(
          CLASSES.base,
          CLASSES.variant[variant()],
          fullWidth() && CLASSES.flag.fullWidth,
          props.class,
        ) }}
        data-theme={props.dataTheme}
        data-slot="ui-select"
        data-open={open() ? "true" : "false"}
        data-disabled={disabled() ? "true" : "false"}
        data-selection-mode={selectionMode()}
      >
        {props.children}
      </div>
    </SelectContext>
  );
};

export type SelectTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> &
  UIBaseProps & {
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const SelectTrigger: Layout<typeof componentRecipe, SelectTriggerProps> = () => {
  const ctx = useContext(SelectContext);
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "disabled",
    "startIcon",
    "endIcon",
    "onClick",
    "onKeyDown",
    "ref",
    "type",
  );

  if (!ctx) {
    return (
      <button
        {...others}
        {...{ class: twMerge(CLASSES.slot.trigger, props.class) }}
        data-theme={props.dataTheme}
        type={props.type ?? "button"}
      >
        {props.startIcon ? (
          <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="ui-select-trigger-start-icon">
            {props.startIcon}
          </span>
        ) : null}
        {props.children}
        {props.endIcon ? (
          <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="ui-select-trigger-end-icon">
            {props.endIcon}
          </span>
        ) : null}
      </button>
    );
  }

  const isDisabled = () => Boolean(props.disabled) || ctx.disabled();

  const setRef = (el: HTMLButtonElement) => {
    ctx.setTriggerRef(el);
    if (typeof props.ref === "function") {
      props.ref(el);
    }
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.toggleOpen();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
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
      type={props.type ?? "button"}
      {...{ class: twMerge(
        CLASSES.slot.trigger,
        ctx.fullWidth() && CLASSES.slot.triggerFullWidth,
        props.class,
      ) }}
      data-theme={props.dataTheme}
      data-slot="ui-select-trigger"
      data-open={ctx.open() ? "true" : "false"}
      aria-haspopup="listbox"
      aria-expanded={ctx.open() ? "true" : "false"}
      aria-controls={ctx.listboxId}
      aria-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {props.startIcon ? (
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="ui-select-trigger-start-icon">
          {props.startIcon}
        </span>
      ) : null}
      {props.children}
      {props.endIcon ? (
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="ui-select-trigger-end-icon">
          {props.endIcon}
        </span>
      ) : null}
    </button>
  );
};

export type SelectValueProps = JSX.HTMLAttributes<HTMLSpanElement> &
  UIBaseProps;

const SelectValue: Layout<typeof componentRecipe, SelectValueProps> = () => {
  const ctx = useContext(SelectContext);
  const others = omit(props, "children", "class", "dataTheme");

  const placeholder = () => ctx?.placeholder() ?? "";
  const text = () => ctx?.selectedText() ?? "";
  const isPlaceholder = () => (ctx?.selectedKeys().length ?? 0) === 0;

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.value, props.class) }}
      data-theme={props.dataTheme}
      data-slot="ui-select-value"
      data-placeholder={isPlaceholder() ? "true" : "false"}
    >
      {props.children ?? (isPlaceholder() ? placeholder() : text())}
    </span>
  );
};

export type SelectIndicatorProps = JSX.HTMLAttributes<HTMLSpanElement> &
  UIBaseProps & {
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const SelectIndicator: Layout<typeof componentRecipe, SelectIndicatorProps> = () => {
  const ctx = useContext(SelectContext);
  const others = omit(props, "children", "class", "dataTheme", "startIcon", "endIcon");

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.indicator, props.class) }}
      data-theme={props.dataTheme}
      data-slot="ui-select-indicator"
      data-open={ctx?.open() ? "true" : "false"}
      aria-hidden="true"
    >
      {props.startIcon ? (
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="ui-select-indicator-start-icon">
          {props.startIcon}
        </span>
      ) : null}
      {props.children}
      {props.endIcon ? (
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="ui-select-indicator-end-icon">
          {props.endIcon}
        </span>
      ) : null}
    </span>
  );
};

export type SelectPopoverProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const SelectPopover: Layout<typeof componentRecipe, SelectPopoverProps> = () => {
  const ctx = useContext(SelectContext);
  const others = omit(props, "children", "class", "dataTheme", "style", "onPointerDown");

  const overlayPosition = createOverlayPosition({
    open: () => ctx?.open() ?? false,
    triggerRef: () => ctx?.triggerRef(),
    overlayRef: () => ctx?.popoverRef(),
    placement: () => ctx?.placement() ?? "bottom",
    offset: () => 6,
    autoFlip: () => ctx?.autoFlip() ?? true,
    align: () => "start",
    matchTriggerWidth: () => true,
    minWidth: () => 224,
  });

  const popoverStyle = () => {
    const overlayStyle = overlayPosition.style();

    if (typeof props.style === "string") {
      return [
        props.style,
        Object.entries(overlayStyle)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join("; "),
      ]
        .filter(Boolean)
        .join("; ");
    }

    return {
      ...(props.style ?? {}),
      ...overlayStyle,
    } as JSX.CSSProperties;
  };

  return (
    <Portal>
      <div
        {...others}
        ref={ctx?.setPopoverRef}
        {...{ class: twMerge(CLASSES.slot.popover, props.class) }}
        data-theme={props.dataTheme}
        data-slot="ui-select-popover"
        data-open={ctx?.open() ? "true" : "false"}
        data-placement={overlayPosition.placement()}
        style={popoverStyle()}
        // `on:pointerdown` was the 1.x escape hatch for a non-delegated
        // listener. 2.0 dropped the namespace; the ordinary prop is what is
        // left, and the stopPropagation below is what mattered here anyway.
        onPointerDown={(event) => {
          invokeEventHandler(props.onPointerDown, event);
          if (!event.defaultPrevented) event.stopPropagation();
        }}
      >
        {props.children}
      </div>
    </Portal>
  );
};

export type SelectListboxProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const SelectListbox: Layout<typeof componentRecipe, SelectListboxProps> = () => {
  const ctx = useContext(SelectContext);
  const others = omit(props, "children", "class", "dataTheme");

  return (
    <div
      {...others}
      id={ctx?.listboxId}
      {...{ class: twMerge(CLASSES.slot.listbox, props.class) }}
      data-theme={props.dataTheme}
      data-slot="ui-select-listbox"
      role="listbox"
      aria-multiselectable={ctx?.selectionMode() === "multiple" ? "true" : undefined}
      tabindex={-1}
    >
      {props.children}
    </div>
  );
};

export type SelectOptionProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "value"> &
  UIBaseProps & {
    value: SelectKey;
    textValue?: string;
    state?: State;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const SelectOption: Layout<typeof componentRecipe, SelectOptionProps> = () => {
  const ctx = useContext(SelectContext);
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "value",
    "textValue",
    "state",
    "disabled",
    "startIcon",
    "endIcon",
    "onClick",
    "onKeyDown",
    "onMouseEnter",
    "ref",
    "type",
  );

  if (!ctx) {
    return (
      <button
        {...others}
        {...{ class: twMerge(CLASSES.slot.option, props.class) }}
        data-theme={props.dataTheme}
        type={props.type ?? "button"}
      >
        {props.startIcon ? (
          <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="ui-select-option-start-icon">
            {props.startIcon}
          </span>
        ) : null}
        {props.children}
        {props.endIcon ? (
          <span {...{ class: CLASSES.slot.optionIndicator }} data-slot="ui-select-option-indicator" aria-hidden="true">
            <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="ui-select-option-end-icon">
              {props.endIcon}
            </span>
          </span>
        ) : null}
      </button>
    );
  }

  const key = () => String(props.value);
  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled) || ctx.disabled();
  const isSelected = () => ctx.isSelected(key());
  const isFocused = () => ctx.focusedKey() === key();
  let optionRef: HTMLButtonElement | undefined;

  const setRef = (el: HTMLButtonElement) => {
    optionRef = el;
    ctx.registerOption({
      key: key(),
      textValue:
        props.textValue ??
        (typeof props.children === "string" ? props.children : key()),
      disabled: isDisabled(),
      ref: el,
    });
    if (typeof props.ref === "function") {
      props.ref(el);
    }
  };

  createTrackedEffect(() => {
    if (!optionRef) return;
    ctx.registerOption({
      key: key(),
      textValue:
        props.textValue ??
        (typeof props.children === "string" ? props.children : key()),
      disabled: isDisabled(),
      ref: optionRef,
    });
  });

  onCleanup(() => {
    ctx.unregisterOption(key());
  });

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.selectKey(key());
  };

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onMouseEnter, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.setFocusedKey(key());
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
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
      type={props.type ?? "button"}
      {...{ class: twMerge(CLASSES.slot.option, props.class) }}
      data-theme={props.dataTheme}
      data-slot="ui-select-option"
      data-selected={isSelected() ? "true" : "false"}
      data-focused={isFocused() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      role="option"
      aria-selected={isSelected() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      tabindex={-1}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={() => ctx.setFocusedKey(key())}
      onKeyDown={handleKeyDown}
    >
      {props.startIcon ? (
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="ui-select-option-start-icon">
          {props.startIcon}
        </span>
      ) : null}
      <span {...{ class: CLASSES.slot.optionLabel }} data-slot="ui-select-option-label">
        {props.children}
      </span>
      {props.endIcon ? (
        <span {...{ class: CLASSES.slot.optionIndicator }} data-slot="ui-select-option-indicator" aria-hidden="true">
          <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="ui-select-option-end-icon">
            {props.endIcon}
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
