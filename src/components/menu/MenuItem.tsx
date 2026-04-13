import {
  createContext,
  createEffect,
  createMemo,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { MenuContext, type MenuItemVariant, type MenuSelectionMode } from "./context";
import { CLASSES } from "./Menu.classes";

type MenuItemRenderProps = {
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  hasSubmenu: boolean;
  selectionMode: MenuSelectionMode;
};

type MenuItemContextValue = {
  renderState: () => MenuItemRenderProps;
};

const MenuItemStateContext = createContext<MenuItemContextValue>();

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const extractTextValue = (nodes: unknown[]): string | undefined => {
  for (const node of nodes) {
    if (typeof node === "string" && node.trim().length > 0) return node.trim();
    if (typeof node === "number") return String(node);
  }
  return undefined;
};

export type MenuItemRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    id?: string | number;
    textValue?: string;
    variant?: MenuItemVariant;
    isDisabled?: boolean;
    disabled?: boolean;
    hasSubmenu?: boolean;
    onAction?: (key: string) => void;
    children?: JSX.Element | ((props: MenuItemRenderProps) => JSX.Element);
  };

export type MenuItemIndicatorType = "checkmark" | "dot";

export type MenuItemIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    type?: MenuItemIndicatorType;
    children?: JSX.Element | ((props: MenuItemRenderProps) => JSX.Element);
  };

export type MenuItemSubmenuIndicatorProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const MenuItemRoot: ParentComponent<MenuItemRootProps> = (props) => {
  const menu = useContext(MenuContext);
  const fallbackKey = createUniqueId();

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
    "textValue",
    "variant",
    "isDisabled",
    "disabled",
    "hasSubmenu",
    "onAction",
    "onClick",
    "onKeyDown",
    "onFocus",
    "onBlur",
    "ref",
    "tabIndex",
    "role",
  ]);

  let itemRef: HTMLDivElement | undefined;

  const key = createMemo(() => {
    if (local.id != null) return String(local.id);
    if (local.textValue) return toSlug(local.textValue);

    const staticChildren = typeof local.children === "function" ? [] : [local.children];
    const textValue = extractTextValue(staticChildren);

    if (textValue) return toSlug(textValue);
    return fallbackKey;
  });

  const variant = () => local.variant ?? "default";
  const selectionMode = () => menu?.selectionMode() ?? "none";
  const isSelected = () => menu?.isSelected(key()) ?? false;
  const isFocused = () => menu?.focusedKey() === key();
  const isDisabled = () =>
    menu?.isItemDisabled(key(), Boolean(local.isDisabled) || Boolean(local.disabled)) ??
    (Boolean(local.isDisabled) || Boolean(local.disabled));

  const renderState = createMemo<MenuItemRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isDisabled: isDisabled(),
    hasSubmenu: Boolean(local.hasSubmenu),
    selectionMode: selectionMode(),
  }));

  const resolvedRole = () => {
    if (local.role) return local.role;
    if (selectionMode() === "multiple") return "menuitemcheckbox";
    if (selectionMode() === "single") return "menuitemradio";
    return "menuitem";
  };

  const resolvedTabIndex = () => {
    if (local.tabIndex !== undefined) return local.tabIndex;
    if (!menu) return isDisabled() ? -1 : 0;
    return menu.getItemTabIndex(key(), isDisabled());
  };

  const handleActivate = (event: Event) => {
    if (event.defaultPrevented || isDisabled()) return;
    menu?.activateKey(key(), event);
    local.onAction?.(key());
  };

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    handleActivate(event);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      menu?.focusNext(1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      menu?.focusNext(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      menu?.focusBoundary("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      menu?.focusBoundary("last");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate(event);
    }
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocus, event);
    if (event.defaultPrevented) return;
    menu?.setFocusedKey(key());
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onBlur, event);
    if (event.defaultPrevented) return;

    if (menu?.focusedKey() === key()) {
      menu.setFocusedKey(undefined);
    }
  };

  createEffect(() => {
    if (!menu || !itemRef) return;

    menu.registerItem({
      key: key(),
      disabled: Boolean(local.isDisabled) || Boolean(local.disabled),
      ref: itemRef,
    });
  });

  onCleanup(() => {
    if (!menu) return;
    menu.unregisterItem(key());
  });

  return (
    <MenuItemStateContext.Provider value={{ renderState }}>
      <div
        {...others}
        ref={(node) => {
          itemRef = node;
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        role={resolvedRole()}
        tabIndex={resolvedTabIndex()}
        aria-selected={selectionMode() === "none" ? undefined : (isSelected() ? "true" : "false")}
        aria-checked={selectionMode() === "none" ? undefined : (isSelected() ? "true" : "false")}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-slot="menu-item"
        data-theme={local.dataTheme}
        data-disabled={isDisabled() ? "true" : "false"}
        data-selected={isSelected() ? "true" : "false"}
        data-focus={isFocused() ? "true" : "false"}
        data-has-submenu={local.hasSubmenu ? "true" : undefined}
        data-selection-mode={selectionMode()}
        data-key={key()}
        {...{ class: twMerge(
          CLASSES.Item.base,
          CLASSES.Item.variant[variant()],
          local.class,
          local.className,
        ) }}
        style={local.style}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {typeof local.children === "function"
          ? (local.children as (props: MenuItemRenderProps) => JSX.Element)(renderState())
          : local.children}
      </div>
    </MenuItemStateContext.Provider>
  );
};

const MenuItemIndicator: Component<MenuItemIndicatorProps> = (props) => {
  const context = useContext(MenuItemStateContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "type",
  ]);

  const renderState = () =>
    context?.renderState() ?? {
      isSelected: false,
      isFocused: false,
      isDisabled: false,
      hasSubmenu: false,
      selectionMode: "none" as const,
    };

  const type = () => local.type ?? "checkmark";

  return (
    <span
      {...others}
      aria-hidden="true"
      data-slot="menu-item-indicator"
      data-theme={local.dataTheme}
      data-type={type()}
      data-visible={renderState().isSelected ? "true" : undefined}
      {...{ class: twMerge(CLASSES.ItemIndicator.base, local.class, local.className) }}
      style={local.style}
    >
      {typeof local.children === "function" ? (
        (local.children as (props: MenuItemRenderProps) => JSX.Element)(renderState())
      ) : local.children ? (
        local.children
      ) : type() === "dot" ? (
        <svg
          aria-hidden="true"
          data-slot="menu-item-indicator--dot"
          fill="currentColor"
          fill-rule="evenodd"
          role="presentation"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path clip-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" fill-rule="evenodd" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          data-slot="menu-item-indicator--checkmark"
          fill="none"
          role="presentation"
          stroke="currentColor"
          stroke-dasharray="22"
          stroke-dashoffset={String(renderState().isSelected ? 44 : 66)}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 17 18"
        >
          <polyline points="1 9 7 14 15 4" />
        </svg>
      )}
    </span>
  );
};

const MenuItemSubmenuIndicator: Component<MenuItemSubmenuIndicatorProps> = (props) => {
  const context = useContext(MenuItemStateContext);
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  if (!context?.renderState().hasSubmenu) {
    return null;
  }

  return (
    <span
      {...others}
      aria-hidden="true"
      data-slot="submenu-indicator"
      data-theme={local.dataTheme}
      {...{ class: twMerge(CLASSES.ItemIndicator.base, CLASSES.ItemIndicator.submenu, local.class, local.className) }}
      style={local.style}
    >
      {local.children ?? (
        <svg
          aria-hidden="true"
          fill="none"
          role="presentation"
          viewBox="0 0 16 16"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 3.5L10 8l-4 4.5" />
        </svg>
      )}
    </span>
  );
};

const MenuItem = Object.assign(MenuItemRoot, {
  Root: MenuItemRoot,
  Indicator: MenuItemIndicator,
  SubmenuIndicator: MenuItemSubmenuIndicator,
});

export default MenuItem;
export { MenuItem, MenuItemRoot, MenuItemIndicator, MenuItemSubmenuIndicator };
export type {
  MenuItemRootProps as MenuItemProps,
  MenuItemRenderProps,
  MenuSelectionMode,
  MenuItemVariant,
};
