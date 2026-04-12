import "./Menu.css";
import {
  For,
  createMemo,
  createSignal,
  splitProps,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import {
  MenuContext,
  type MenuFocusTarget,
  type MenuItemRecord,
  type MenuSelectionMode,
} from "./context";
import MenuItem, {
  MenuItemIndicator,
  MenuItemRoot,
} from "./MenuItem";
import MenuSection, { MenuSectionRoot } from "./MenuSection";

const normalizeKeys = (keys?: Iterable<string | number>): Set<string> => {
  if (!keys) return new Set();
  return new Set(Array.from(keys, (key) => String(key)));
};

const sortItemsByDomOrder = (items: MenuItemRecord[]) =>
  [...items].sort((a, b) => {
    if (a.ref === b.ref) return 0;
    const relation = a.ref.compareDocumentPosition(b.ref);
    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
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

export type MenuRootProps<T = unknown> = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> &
  IComponentBaseProps & {
    children?: JSX.Element | ((item: T) => JSX.Element);
    items?: readonly T[];
    renderEmptyState?: () => JSX.Element;
    selectionMode?: MenuSelectionMode;
    selectedKeys?: Iterable<string | number>;
    defaultSelectedKeys?: Iterable<string | number>;
    disabledKeys?: Iterable<string | number>;
    disallowEmptySelection?: boolean;
    onSelectionChange?: (keys: Set<string>) => void;
    onAction?: (key: string) => void;
    isDisabled?: boolean;
    disabled?: boolean;
  };

const MenuRoot: Component<MenuRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "items",
    "renderEmptyState",
    "selectionMode",
    "selectedKeys",
    "defaultSelectedKeys",
    "disabledKeys",
    "disallowEmptySelection",
    "onSelectionChange",
    "onAction",
    "isDisabled",
    "disabled",
    "role",
    "onKeyDown",
  ]);

  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal(
    normalizeKeys(local.defaultSelectedKeys),
  );
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>();
  const [registeredItems, setRegisteredItems] = createSignal<MenuItemRecord[]>([]);

  const selectionMode = () => local.selectionMode ?? "none";
  const isControlled = () => local.selectedKeys !== undefined;
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const selectedKeys = createMemo(() =>
    isControlled() ? normalizeKeys(local.selectedKeys) : internalSelectedKeys(),
  );
  const disabledKeys = createMemo(() => normalizeKeys(local.disabledKeys));

  const getEnabledItems = () =>
    registeredItems().filter(
      (item) => !item.disabled && !disabledKeys().has(item.key) && !isDisabled(),
    );

  const focusItem = (item: MenuItemRecord | undefined) => {
    if (!item) return;
    setFocusedKey(item.key);
    item.ref.focus();
  };

  const focusBoundary = (target: MenuFocusTarget) => {
    const enabledItems = getEnabledItems();
    if (!enabledItems.length) return;

    if (target === "selected") {
      const selectedItem = enabledItems.find((item) => selectedKeys().has(item.key));
      focusItem(selectedItem ?? enabledItems[0]);
      return;
    }

    focusItem(target === "first" ? enabledItems[0] : enabledItems[enabledItems.length - 1]);
  };

  const focusNext = (direction: 1 | -1) => {
    const enabledItems = getEnabledItems();
    if (!enabledItems.length) return;

    const activeElement = document.activeElement;
    let currentIndex = enabledItems.findIndex((item) => item.ref === activeElement);

    if (currentIndex < 0 && focusedKey()) {
      currentIndex = enabledItems.findIndex((item) => item.key === focusedKey());
    }

    if (currentIndex < 0) {
      focusBoundary(direction === 1 ? "first" : "last");
      return;
    }

    const nextIndex = (currentIndex + direction + enabledItems.length) % enabledItems.length;
    focusItem(enabledItems[nextIndex]);
  };

  const updateSelection = (nextKeys: Set<string>) => {
    if (!isControlled()) {
      setInternalSelectedKeys(nextKeys);
    }

    local.onSelectionChange?.(nextKeys);
  };

  const activateKey = (key: string, event: Event) => {
    if (event.defaultPrevented || isDisabled()) return;
    if (disabledKeys().has(key)) return;

    if (selectionMode() === "none") {
      local.onAction?.(key);
      return;
    }

    const current = selectedKeys();

    if (selectionMode() === "single") {
      if (!(current.size === 1 && current.has(key))) {
        updateSelection(new Set([key]));
      }
      local.onAction?.(key);
      return;
    }

    const next = new Set(current);

    if (next.has(key)) {
      if (local.disallowEmptySelection && next.size === 1) {
        local.onAction?.(key);
        return;
      }
      next.delete(key);
    } else {
      next.add(key);
    }

    updateSelection(next);
    local.onAction?.(key);
  };

  const registerItem = (item: MenuItemRecord) => {
    setRegisteredItems((current) =>
      sortItemsByDomOrder([...current.filter((entry) => entry.key !== item.key), item]),
    );
  };

  const unregisterItem = (key: string) => {
    setRegisteredItems((current) => current.filter((item) => item.key !== key));
    if (focusedKey() === key) {
      setFocusedKey(undefined);
    }
  };

  const isItemDisabled = (key: string, localDisabled?: boolean) =>
    Boolean(localDisabled) || disabledKeys().has(key) || isDisabled();

  const getItemTabIndex = (key: string, localDisabled?: boolean) => {
    if (isItemDisabled(key, localDisabled)) return -1;

    if (focusedKey() === key) return 0;

    if (!focusedKey()) {
      const enabledItems = getEnabledItems();
      if (!enabledItems.length) return -1;
      return enabledItems[0]?.key === key ? 0 : -1;
    }

    return -1;
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);

    if (event.defaultPrevented) return;
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      focusNext(1);
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      focusNext(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusBoundary("first");
    }

    if (event.key === "End") {
      event.preventDefault();
      focusBoundary("last");
    }
  };

  const renderChildren = (): JSX.Element => {
    const isItemRenderer =
      typeof local.children === "function" &&
      (local.children as (...args: unknown[]) => unknown).length > 0;

    const resolvedStaticChildren =
      typeof local.children === "function"
        ? isItemRenderer
          ? null
          : (local.children as () => JSX.Element)()
        : (local.children ?? null);

    if (local.items) {
      if (local.items.length === 0) {
        return local.renderEmptyState?.() ?? null;
      }

      if (isItemRenderer) {
        const renderItem = local.children as (item: unknown) => JSX.Element;
        return <For each={local.items}>{(item) => renderItem(item)}</For>;
      }

      return resolvedStaticChildren;
    }

    return resolvedStaticChildren;
  };

  return (
    <MenuContext.Provider
      value={{
        selectionMode,
        selectedKeys,
        disabledKeys,
        isDisabled,
        focusedKey,
        isSelected: (key: string) => selectedKeys().has(key),
        isItemDisabled,
        getItemTabIndex,
        registerItem,
        unregisterItem,
        activateKey,
        setFocusedKey,
        focusNext,
        focusBoundary,
      }}
    >
      <div
        {...others}
        role={local.role ?? "menu"}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-slot="menu"
        data-theme={local.dataTheme}
        data-selection-mode={selectionMode()}
        data-disabled={isDisabled() ? "true" : "false"}
        class={twMerge("menu", local.class, local.className)}
        style={local.style}
        onKeyDown={handleKeyDown}
      >
        {renderChildren()}
      </div>
    </MenuContext.Provider>
  );
};

const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Item: MenuItem,
  ItemIndicator: MenuItemIndicator,
  Section: MenuSection,
});

export default Menu;
export { Menu, MenuRoot, MenuItem, MenuItemRoot, MenuItemIndicator, MenuSection, MenuSectionRoot };
export type { MenuRootProps as MenuProps, MenuSelectionMode };
