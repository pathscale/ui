import {createContext, createEffect, createMemo, createUniqueId, onCleanup, omit, useContext, type Component, type ParentComponent} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps, State } from "../vocabulary";
import { MenuContext, type MenuItemVariant, type MenuSelectionMode } from "./context";
import { CLASSES } from "./Menu.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Menu.recipe";

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

/* A default rather than an empty context; see ListBoxItem for why. */
const MenuItemStateContext = createContext<MenuItemContextValue>({
  renderState: () => ({ isSelected: false, isFocused: false, isDisabled: false }),
});

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
  UIBaseProps & {
    id?: string | number;
    textValue?: string;
    variant?: MenuItemVariant;
    state?: State;
    disabled?: boolean;
    hasSubmenu?: boolean;
    onAction?: (key: string) => void;
    children?: JSX.Element | ((props: MenuItemRenderProps) => JSX.Element);
  };

export type MenuItemIndicatorType = "checkmark" | "dot";

export type MenuItemIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps & {
    type?: MenuItemIndicatorType;
    children?: JSX.Element | ((props: MenuItemRenderProps) => JSX.Element);
  };

export type MenuItemSubmenuIndicatorProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const MenuItemRoot: Layout<typeof componentRecipe, MenuItemRootProps> = () => {
  const menu = useContext(MenuContext);
  const fallbackKey = createUniqueId();

  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "id",
    "textValue",
    "variant",
    "state",
    "disabled",
    "hasSubmenu",
    "onAction",
    "onClick",
    "onKeyDown",
    "onFocus",
    "onBlur",
    "ref",
    "tabindex",
    "role",
  );

  let itemRef: HTMLDivElement | undefined;

  const key = createMemo(() => {
    if (props.id != null) return String(props.id);
    if (props.textValue) return toSlug(props.textValue);

    const staticChildren = typeof props.children === "function" ? [] : [props.children];
    const textValue = extractTextValue(staticChildren);

    if (textValue) return toSlug(textValue);
    return fallbackKey;
  });

  const variant = () => props.variant ?? "default";
  const selectionMode = () => menu?.selectionMode() ?? "none";
  const isSelected = () => menu?.isSelected(key()) ?? false;
  const isFocused = () => menu?.focusedKey() === key();
  const isDisabled = () =>
    menu?.isItemDisabled(key(), Boolean((props.state === "disabled")) || Boolean(props.disabled)) ??
    (Boolean((props.state === "disabled")) || Boolean(props.disabled));

  const renderState = createMemo<MenuItemRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isDisabled: isDisabled(),
    hasSubmenu: Boolean(props.hasSubmenu),
    selectionMode: selectionMode(),
  }));

  const resolvedRole = () => {
    if (props.role) return props.role;
    if (selectionMode() === "multiple") return "menuitemcheckbox";
    if (selectionMode() === "single") return "menuitemradio";
    return "menuitem";
  };

  const resolvedTabIndex = () => {
    if (props.tabindex !== undefined) return props.tabindex;
    if (!menu) return isDisabled() ? -1 : 0;
    return menu.getItemTabIndex(key(), isDisabled());
  };

  const handleActivate = (event: Event) => {
    if (event.defaultPrevented || isDisabled()) return;
    menu?.activateKey(key(), event);
    props.onAction?.(key());
  };

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    handleActivate(event);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
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
    invokeEventHandler(props.onFocus, event);
    if (event.defaultPrevented) return;
    menu?.setFocusedKey(key());
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(props.onBlur, event);
    if (event.defaultPrevented) return;

    if (menu?.focusedKey() === key()) {
      menu.setFocusedKey(undefined);
    }
  };

  createEffect(() => {
    if (!menu || !itemRef) return;

    menu.registerItem({
      key: key(),
      disabled: Boolean((props.state === "disabled")) || Boolean(props.disabled),
      ref: itemRef,
    });
  });

  onCleanup(() => {
    if (!menu) return;
    menu.unregisterItem(key());
  });

  return (
    <MenuItemStateContext value={{ renderState }}>
      <div
        {...others}
        ref={(node) => {
          itemRef = node;
          if (typeof props.ref === "function") {
            props.ref(node);
          }
        }}
        role={resolvedRole()}
        tabindex={resolvedTabIndex()}
        aria-selected={selectionMode() === "none" ? undefined : (isSelected() ? "true" : "false")}
        aria-checked={selectionMode() === "none" ? undefined : (isSelected() ? "true" : "false")}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-slot="menu-item"
        data-theme={props.dataTheme}
        data-disabled={isDisabled() ? "true" : "false"}
        data-selected={isSelected() ? "true" : "false"}
        data-focus={isFocused() ? "true" : "false"}
        data-has-submenu={props.hasSubmenu ? "true" : undefined}
        data-selection-mode={selectionMode()}
        data-key={key()}
        {...{ class: twMerge(
          CLASSES.Item.base,
          CLASSES.Item.variant[variant()],
          props.class,
        ) }}
        style={props.style}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {typeof props.children === "function"
          ? (props.children as (props: MenuItemRenderProps) => JSX.Element)(renderState())
          : props.children}
      </div>
    </MenuItemStateContext>
  );
};

const MenuItemIndicator: Layout<typeof componentRecipe, MenuItemIndicatorProps> = () => {
  const context = useContext(MenuItemStateContext);
  const others = omit(props, "children", "class", "dataTheme", "style", "type");

  const renderState = () =>
    context?.renderState() ?? {
      isSelected: false,
      isFocused: false,
      isDisabled: false,
      hasSubmenu: false,
      selectionMode: "none" as const,
    };

  const type = () => props.type ?? "checkmark";

  return (
    <span
      {...others}
      aria-hidden="true"
      data-slot="menu-item-indicator"
      data-theme={props.dataTheme}
      data-type={type()}
      data-visible={renderState().isSelected ? "true" : undefined}
      {...{ class: twMerge(CLASSES.ItemIndicator.base, props.class) }}
      style={props.style}
    >
      {typeof props.children === "function" ? (
        (props.children as (props: MenuItemRenderProps) => JSX.Element)(renderState())
      ) : props.children ? (
        props.children
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

const MenuItemSubmenuIndicator: Layout<typeof componentRecipe, MenuItemSubmenuIndicatorProps> = () => {
  const context = useContext(MenuItemStateContext);
  const others = omit(props, "children", "class", "dataTheme", "style");

  if (!context?.renderState().hasSubmenu) {
    return null;
  }

  return (
    <span
      {...others}
      aria-hidden="true"
      data-slot="submenu-indicator"
      data-theme={props.dataTheme}
      {...{ class: twMerge(CLASSES.ItemIndicator.base, CLASSES.ItemIndicator.submenu, props.class) }}
      style={props.style}
    >
      {props.children ?? (
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
