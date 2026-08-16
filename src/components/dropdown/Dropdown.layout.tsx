import "./Dropdown.css";
import {Show, createContext, createSignal, createTrackedEffect, createUniqueId, onCleanup, onSettled, omit, useContext, type Accessor} from "solid-js";
import { Portal, type JSX} from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import {
  createOverlayPosition,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import { CLASSES } from "./Dropdown.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Dropdown.recipe";

type DropdownAlign = "start" | "end";
type DropdownPlacement = OverlayPlacement;
type DropdownFocusRequest = "first" | "last" | null;

type DropdownItemRecord = {
  key: string;
  ref: HTMLButtonElement;
  disabled: boolean;
};

type DropdownContextValue = {
  open: Accessor<boolean>;
  disabled: Accessor<boolean>;
  triggerId: string;
  menuId: string;
  placement: Accessor<DropdownPlacement>;
  autoFlip: Accessor<boolean>;
  triggerRef: Accessor<HTMLButtonElement | undefined>;
  menuRef: Accessor<HTMLDivElement | undefined>;
  focusedKey: Accessor<string | undefined>;
  setFocusedKey: (key: string | undefined) => void;
  setOpen: (next: boolean, options?: { focusTrigger?: boolean }) => void;
  toggleOpen: () => void;
  focusNext: (direction: 1 | -1) => void;
  focusBoundary: (target: "first" | "last") => void;
  requestFocus: (target: DropdownFocusRequest) => void;
  registerItem: (item: DropdownItemRecord) => void;
  unregisterItem: (key: string) => void;
  setTriggerRef: (el: HTMLButtonElement) => void;
  setMenuRef: (el: HTMLDivElement) => void;
  setRootRef: (el: HTMLDivElement) => void;
};

const DropdownContext = createContext<DropdownContextValue>();

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const sortItemsByDomOrder = (items: DropdownItemRecord[]) =>
  [...items].sort((a, b) => {
    if (a.ref === b.ref) return 0;
    const relation = a.ref.compareDocumentPosition(b.ref);
    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

type DropdownRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  children: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DropdownPlacement;
  autoFlip?: boolean;
  disabled?: boolean;
  dataTheme?: string;
};

const DropdownRoot: Layout<typeof componentRecipe, DropdownRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "open",
    "defaultOpen",
    "onOpenChange",
    "placement",
    "autoFlip",
    "disabled",
    "dataTheme",
    "ref",
  );

  const baseId = createUniqueId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;

  const [internalOpen, setInternalOpen] = createSignal(Boolean(props.defaultOpen));
  const [items, setItems] = createSignal<DropdownItemRecord[]>([]);
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>(undefined);
  const [focusRequest, setFocusRequest] = createSignal<DropdownFocusRequest>(null);
  const [triggerRef, setTriggerRefSignal] = createSignal<HTMLButtonElement | undefined>(undefined);
  const [menuRef, setMenuRefSignal] = createSignal<HTMLDivElement | undefined>(undefined);
  const [rootRef, setRootRefSignal] = createSignal<HTMLDivElement | undefined>(undefined);

  const isControlled = () => props.open !== undefined;
  const isDisabled = () => Boolean(props.disabled);
  const open = () => (isControlled() ? Boolean(props.open) : internalOpen());
  const placement = () => props.placement ?? "bottom";
  const autoFlip = () => props.autoFlip ?? true;

  const setRootRef = (el: HTMLDivElement) => {
    setRootRefSignal(el);
    if (typeof props.ref === "function") {
      props.ref(el);
    }
  };

  const setTriggerRef = (el: HTMLButtonElement) => {
    setTriggerRefSignal(el);
  };

  const setMenuRef = (el: HTMLDivElement) => {
    setMenuRefSignal(el);
  };

  const getEnabledItems = () => items().filter((item) => !item.disabled);

  const focusItem = (item: DropdownItemRecord | undefined) => {
    if (!item) return;
    setFocusedKey(item.key);
    item.ref.focus();
  };

  const focusBoundary = (target: "first" | "last") => {
    const enabled = getEnabledItems();
    if (!enabled.length) return;
    focusItem(target === "first" ? enabled[0] : enabled[enabled.length - 1]);
  };

  const focusNext = (direction: 1 | -1) => {
    const enabled = getEnabledItems();
    if (!enabled.length) return;

    const active = document.activeElement;
    let currentIndex = enabled.findIndex((item) => item.ref === active);
    if (currentIndex < 0) {
      currentIndex = enabled.findIndex((item) => item.key === focusedKey());
    }
    if (currentIndex < 0) {
      focusItem(direction === 1 ? enabled[0] : enabled[enabled.length - 1]);
      return;
    }

    const nextIndex = (currentIndex + direction + enabled.length) % enabled.length;
    focusItem(enabled[nextIndex]);
  };

  const setOpen = (next: boolean, options?: { focusTrigger?: boolean }) => {
    if (next && isDisabled()) return;

    const current = open();
    if (!isControlled()) {
      setInternalOpen(next);
    }
    if (current !== next) {
      props.onOpenChange?.(next);
    }
    if (!next) {
      setFocusedKey(undefined);
      setFocusRequest(null);
      if (options?.focusTrigger) {
        triggerRef()?.focus();
      }
    }
  };

  const toggleOpen = () => {
    setOpen(!open());
  };

  const registerItem = (item: DropdownItemRecord) => {
    setItems((prev) => sortItemsByDomOrder([...prev.filter((entry) => entry.key !== item.key), item]));
    if (!item.disabled && focusedKey() === undefined) {
      setFocusedKey(item.key);
    }
  };

  const unregisterItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
    if (focusedKey() === key) {
      setFocusedKey(undefined);
    }
  };

  createTrackedEffect(() => {
    if (!open()) return;
    const request = focusRequest();
    if (!request) return;
    focusBoundary(request === "first" ? "first" : "last");
    setFocusRequest(null);
  });

  createTrackedEffect(() => {
    const list = items();
    const currentFocused = focusedKey();

    if (currentFocused && !list.some((item) => item.key === currentFocused)) {
      setFocusedKey(undefined);
      return;
    }

    if (open() && !currentFocused) {
      const firstEnabled = list.find((item) => !item.disabled);
      if (firstEnabled) {
        setFocusedKey(firstEnabled.key);
      }
    }
  });

  onSettled(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!open()) return;
      const target = event.target as Node;
      if (rootRef()?.contains(target)) return;
      if (menuRef()?.contains(target)) return;
      if (triggerRef()?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  });

  return (
    <DropdownContext
      value={{
        open,
        disabled: isDisabled,
        triggerId,
        menuId,
        placement,
        autoFlip,
        triggerRef,
        menuRef,
        focusedKey,
        setFocusedKey,
        setOpen,
        toggleOpen,
        focusNext,
        focusBoundary,
        requestFocus: setFocusRequest,
        registerItem,
        unregisterItem,
        setTriggerRef,
        setMenuRef,
        setRootRef,
      }}
    >
      <div
        {...others}
        ref={setRootRef}
        {...{ class: twMerge(CLASSES.base, props.class) }}
        data-theme={props.dataTheme}
        data-slot="dropdown"
        data-open={open() ? "true" : "false"}
      >
        {props.children}
      </div>
    </DropdownContext>
  );
};

type DropdownTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownTrigger: Layout<typeof componentRecipe, DropdownTriggerProps> = () => {
  const ctx = useContext(DropdownContext);
  const others = omit(
    props,
    "class",
    "children",
    "disabled",
    "onClick",
    "onKeyDown",
    "ref",
    "type",
  );

  if (!ctx) {
    return (
      <button {...others} {...{ class: twMerge(CLASSES.slot.trigger, props.class) }} type={props.type ?? "button"}>
        {props.children}
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
        ctx.requestFocus("first");
      } else {
        ctx.focusNext(1);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!ctx.open()) {
        ctx.setOpen(true);
        ctx.requestFocus("last");
      } else {
        ctx.focusNext(-1);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (ctx.open()) {
        ctx.setOpen(false);
      } else {
        ctx.setOpen(true);
      }
      return;
    }

    if (event.key === "Escape" && ctx.open()) {
      event.preventDefault();
      ctx.setOpen(false, { focusTrigger: true });
    }
  };

  return (
    <button
      {...others}
      ref={setRef}
      id={ctx.triggerId}
      type={props.type ?? "button"}
      {...{ class: twMerge(CLASSES.slot.trigger, props.class) }}
      data-slot="dropdown-trigger"
      aria-haspopup="menu"
      aria-expanded={ctx.open() ? "true" : "false"}
      aria-controls={ctx.menuId}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {props.children}
    </button>
  );
};

type DropdownMenuProps = JSX.HTMLAttributes<HTMLDivElement> & {
  align?: DropdownAlign;
  placement?: DropdownPlacement;
  autoFlip?: boolean;
  sideOffset?: number;
};

const DropdownMenu: Layout<typeof componentRecipe, DropdownMenuProps> = () => {
  const ctx = useContext(DropdownContext);
  const others = omit(
    props,
    "class",
    "children",
    "align",
    "placement",
    "autoFlip",
    "sideOffset",
    "onKeyDown",
    "style",
    "role",
  );

  if (!ctx) {
    return (
      <div {...others} {...{ class: twMerge(CLASSES.slot.popover, props.class) }}>
        <div {...{ class: CLASSES.slot.menu }}>{props.children}</div>
      </div>
    );
  }

  const overlayPosition = createOverlayPosition({
    open: ctx.open,
    triggerRef: ctx.triggerRef,
    overlayRef: ctx.menuRef,
    placement: () => props.placement ?? ctx.placement(),
    offset: () => props.sideOffset ?? 6,
    autoFlip: () => props.autoFlip ?? ctx.autoFlip(),
    align: () => (props.align === "end" ? "end" : "start"),
  });

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
    if (event.defaultPrevented) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        ctx.focusNext(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        ctx.focusNext(-1);
        break;
      case "Home":
        event.preventDefault();
        ctx.focusBoundary("first");
        break;
      case "End":
        event.preventDefault();
        ctx.focusBoundary("last");
        break;
      case "Escape":
        event.preventDefault();
        ctx.setOpen(false, { focusTrigger: true });
        break;
      case "Tab":
        ctx.setOpen(false);
        break;
      default:
        break;
    }
  };

  const menuStyle = () => {
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
    <Show when={ctx.open()}>
      <Portal>
        <div
          {...others}
          ref={ctx.setMenuRef}
          id={ctx.menuId}
          {...{ class: twMerge(CLASSES.slot.popover, props.class) }}
          role={props.role ?? "menu"}
          data-slot="dropdown-popover"
          data-open={ctx.open() ? "true" : "false"}
          data-align={props.align ?? "start"}
          data-placement={overlayPosition.placement()}
          aria-hidden={ctx.open() ? "false" : "true"}
          style={menuStyle()}
          onKeyDown={handleKeyDown}
        >
          <div {...{ class: CLASSES.slot.menu }} data-slot="dropdown-menu">
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
};

type DropdownItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  closeOnSelect?: boolean;
};

const DropdownItem: Layout<typeof componentRecipe, DropdownItemProps> = () => {
  const ctx = useContext(DropdownContext);
  const others = omit(
    props,
    "class",
    "children",
    "disabled",
    "closeOnSelect",
    "onClick",
    "onMouseEnter",
    "onFocus",
    "ref",
    "role",
    "type",
  );
  const itemKey = createUniqueId();

  let itemRef: HTMLButtonElement | undefined;

  if (ctx) {
    onSettled(() => {
      if (itemRef) {
        ctx.registerItem({
          key: itemKey,
          ref: itemRef,
          disabled: Boolean(props.disabled),
        });
      }
    });

    onCleanup(() => {
      ctx.unregisterItem(itemKey);
    });
  }

  const isDisabled = () => Boolean(props.disabled);

  const setRef = (el: HTMLButtonElement) => {
    itemRef = el;
    if (typeof props.ref === "function") {
      props.ref(el);
    }
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    if (ctx && (props.closeOnSelect ?? true)) {
      ctx.setOpen(false, { focusTrigger: true });
    }
  };

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onMouseEnter, event);
    if (event.defaultPrevented) return;
    if (ctx && !isDisabled()) {
      ctx.setFocusedKey(itemKey);
    }
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = (event) => {
    invokeEventHandler(props.onFocus, event);
    if (event.defaultPrevented) return;
    if (ctx && !isDisabled()) {
      ctx.setFocusedKey(itemKey);
    }
  };

  return (
    <button
      {...others}
      ref={setRef}
      type={props.type ?? "button"}
      role={props.role ?? "menuitem"}
      {...{ class: twMerge(CLASSES.slot.item, props.class) }}
      data-slot="menu-item"
      data-disabled={isDisabled() ? "true" : "false"}
      data-focused={ctx?.focusedKey() === itemKey ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      tabindex={ctx ? (ctx.open() && ctx.focusedKey() === itemKey ? 0 : -1) : 0}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    >
      {props.children}
    </button>
  );
};

type DropdownGroupProps = JSX.HTMLAttributes<HTMLDivElement>;

const DropdownGroup: Layout<typeof componentRecipe, DropdownGroupProps> = () => {
  const others = omit(props, "class", "children");
  return (
    <div {...others} role="group" {...{ class: twMerge(CLASSES.slot.group, props.class) }} data-slot="dropdown-group">
      {props.children}
    </div>
  );
};

type DropdownSeparatorProps = JSX.HTMLAttributes<HTMLDivElement>;

const DropdownSeparator: Layout<typeof componentRecipe, DropdownSeparatorProps> = () => {
  const others = omit(props, "class");
  return (
    <div
      {...others}
      role="separator"
      {...{ class: twMerge(CLASSES.slot.separator, props.class) }}
      data-slot="separator"
      aria-orientation="horizontal"
    />
  );
};

const Dropdown = Object.assign(DropdownRoot, {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Group: DropdownGroup,
  Separator: DropdownSeparator,
});

export {
  Dropdown as default,
  Dropdown,
  DropdownRoot,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownGroup,
  DropdownSeparator,
};

export type {
  DropdownAlign,
  DropdownPlacement,
  DropdownRootProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
  DropdownGroupProps,
  DropdownSeparatorProps,
};
