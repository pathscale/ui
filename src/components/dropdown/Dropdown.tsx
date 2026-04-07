import "./Dropdown.css";
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

type DropdownAlign = "start" | "end";
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
  disabled?: boolean;
  dataTheme?: string;
  className?: string;
};

const DropdownRoot = (props: DropdownRootProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "open",
    "defaultOpen",
    "onOpenChange",
    "disabled",
    "dataTheme",
    "className",
    "ref",
  ]);

  const baseId = createUniqueId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [items, setItems] = createSignal<DropdownItemRecord[]>([]);
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>(undefined);
  const [focusRequest, setFocusRequest] = createSignal<DropdownFocusRequest>(null);
  const [triggerRef, setTriggerRefSignal] = createSignal<HTMLButtonElement | undefined>(undefined);
  const [rootRef, setRootRefSignal] = createSignal<HTMLDivElement | undefined>(undefined);

  const isControlled = () => local.open !== undefined;
  const isDisabled = () => Boolean(local.disabled);
  const open = () => (isControlled() ? Boolean(local.open) : internalOpen());

  const setRootRef = (el: HTMLDivElement) => {
    setRootRefSignal(el);
    if (typeof local.ref === "function") {
      local.ref(el);
    }
  };

  const setTriggerRef = (el: HTMLButtonElement) => {
    setTriggerRefSignal(el);
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
      local.onOpenChange?.(next);
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

  createEffect(() => {
    if (!open()) return;
    const request = focusRequest();
    if (!request) return;
    focusBoundary(request === "first" ? "first" : "last");
    setFocusRequest(null);
  });

  createEffect(() => {
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
    <DropdownContext.Provider
      value={{
        open,
        disabled: isDisabled,
        triggerId,
        menuId,
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
        setRootRef,
      }}
    >
      <div
        {...others}
        ref={setRootRef}
        class={twMerge("dropdown", local.class, local.className)}
        data-theme={local.dataTheme}
        data-slot="dropdown"
        data-open={open() ? "true" : "false"}
      >
        {local.children}
      </div>
    </DropdownContext.Provider>
  );
};

type DropdownTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownTrigger = (props: DropdownTriggerProps): JSX.Element => {
  const ctx = useContext(DropdownContext);
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "disabled",
    "onClick",
    "onKeyDown",
    "ref",
    "type",
  ]);

  if (!ctx) {
    return (
      <button {...others} class={twMerge("dropdown__trigger", local.class)} type={local.type ?? "button"}>
        {local.children}
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
      type={local.type ?? "button"}
      class={twMerge("dropdown__trigger", local.class)}
      data-slot="dropdown-trigger"
      aria-haspopup="menu"
      aria-expanded={ctx.open()}
      aria-controls={ctx.menuId}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {local.children}
    </button>
  );
};

type DropdownMenuProps = JSX.HTMLAttributes<HTMLDivElement> & {
  align?: DropdownAlign;
  sideOffset?: number;
};

const DropdownMenu = (props: DropdownMenuProps): JSX.Element => {
  const ctx = useContext(DropdownContext);
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "align",
    "sideOffset",
    "onKeyDown",
    "style",
    "role",
  ]);

  if (!ctx) {
    return (
      <div {...others} class={twMerge("dropdown__popover", local.class)}>
        <div class="dropdown__menu">{local.children}</div>
      </div>
    );
  }

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
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
    if (typeof local.style === "string") {
      return `${local.style}; --dropdown-offset: ${local.sideOffset ?? 6}px;`;
    }
    return {
      ...(local.style ?? {}),
      "--dropdown-offset": `${local.sideOffset ?? 6}px`,
    } as JSX.CSSProperties;
  };

  return (
    <div
      {...others}
      id={ctx.menuId}
      class={twMerge("dropdown__popover", local.class)}
      role={local.role ?? "menu"}
      data-slot="dropdown-popover"
      data-open={ctx.open() ? "true" : "false"}
      data-align={local.align ?? "start"}
      aria-hidden={ctx.open() ? "false" : "true"}
      style={menuStyle()}
      onKeyDown={handleKeyDown}
    >
      <div class="dropdown__menu" data-slot="dropdown-menu">
        {local.children}
      </div>
    </div>
  );
};

type DropdownItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  closeOnSelect?: boolean;
};

const DropdownItem = (props: DropdownItemProps): JSX.Element => {
  const ctx = useContext(DropdownContext);
  const [local, others] = splitProps(props, [
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
  ]);
  const itemKey = createUniqueId();

  let itemRef: HTMLButtonElement | undefined;

  if (ctx) {
    onMount(() => {
      if (itemRef) {
        ctx.registerItem({
          key: itemKey,
          ref: itemRef,
          disabled: Boolean(local.disabled),
        });
      }
    });

    onCleanup(() => {
      ctx.unregisterItem(itemKey);
    });
  }

  const isDisabled = () => Boolean(local.disabled);

  const setRef = (el: HTMLButtonElement) => {
    itemRef = el;
    if (typeof local.ref === "function") {
      local.ref(el);
    }
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    if (ctx && (local.closeOnSelect ?? true)) {
      ctx.setOpen(false, { focusTrigger: true });
    }
  };

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onMouseEnter, event);
    if (event.defaultPrevented) return;
    if (ctx && !isDisabled()) {
      ctx.setFocusedKey(itemKey);
    }
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocus, event);
    if (event.defaultPrevented) return;
    if (ctx && !isDisabled()) {
      ctx.setFocusedKey(itemKey);
    }
  };

  return (
    <button
      {...others}
      ref={setRef}
      type={local.type ?? "button"}
      role={local.role ?? "menuitem"}
      class={twMerge("dropdown__item", local.class)}
      data-slot="dropdown-item"
      data-disabled={isDisabled() ? "true" : "false"}
      data-focused={ctx?.focusedKey() === itemKey ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      tabIndex={ctx ? (ctx.open() && ctx.focusedKey() === itemKey ? 0 : -1) : 0}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    >
      {local.children}
    </button>
  );
};

type DropdownGroupProps = JSX.HTMLAttributes<HTMLDivElement>;

const DropdownGroup = (props: DropdownGroupProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div {...others} role="group" class={twMerge("dropdown__group", local.class)} data-slot="dropdown-group">
      {local.children}
    </div>
  );
};

type DropdownSeparatorProps = JSX.HTMLAttributes<HTMLDivElement>;

const DropdownSeparator = (props: DropdownSeparatorProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      {...others}
      role="separator"
      class={twMerge("dropdown__separator", local.class)}
      data-slot="dropdown-separator"
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
  DropdownRootProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
  DropdownGroupProps,
  DropdownSeparatorProps,
};
