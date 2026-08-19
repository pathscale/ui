import "./ListBox.css";
import type { JSX } from "@solidjs/web";
import { type Component, createMemo, createSignal, For, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { State, UIBaseProps } from "../vocabulary";
import {
  ListBoxContext,
  type ListBoxFocusTarget,
  type ListBoxItemRecord,
  type ListBoxSelectionMode,
  type ListBoxVariant,
} from "./context";
import { CLASSES, type componentRecipe } from "./ListBox.recipe";

const normalizeKeys = (keys?: Iterable<string | number>): Set<string> => {
  if (!keys) return new Set();
  return new Set(Array.from(keys, (key) => String(key)));
};

const sortItemsByDomOrder = (items: ListBoxItemRecord[]) =>
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

export type ListBoxRootProps<T = unknown> = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> &
  UIBaseProps & {
    children?: JSX.Element | ((item: T) => JSX.Element);
    items?: readonly T[];
    renderEmpty?: () => JSX.Element;
    variant?: ListBoxVariant;
    selectionMode?: ListBoxSelectionMode;
    selectedKeys?: Iterable<string | number>;
    defaultSelectedKeys?: Iterable<string | number>;
    disabledKeys?: Iterable<string | number>;
    disallowEmptySelection?: boolean;
    onSelectionChange?: (keys: Set<string>) => void;
    onAction?: (key: string) => void;
    state?: State;
    disabled?: boolean;
  };

const ListBoxRoot: Layout<typeof componentRecipe, ListBoxRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "items",
    "renderEmpty",
    "variant",
    "selectionMode",
    "selectedKeys",
    "defaultSelectedKeys",
    "disabledKeys",
    "disallowEmptySelection",
    "onSelectionChange",
    "onAction",
    "state",
    "disabled",
    "role",
    "onKeyDown",
  );

  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal(
    normalizeKeys(props.defaultSelectedKeys),
  );
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>();
  const [registeredItems, setRegisteredItems] = createSignal<
    ListBoxItemRecord[]
  >([]);

  const variant = () => props.variant ?? "default";
  const selectionMode = () => props.selectionMode ?? "none";
  const isControlled = () => props.selectedKeys !== undefined;
  const isDisabled = () =>
    Boolean(props.state === "disabled") || Boolean(props.disabled);
  const selectedKeys = createMemo(() =>
    isControlled() ? normalizeKeys(props.selectedKeys) : internalSelectedKeys(),
  );
  const disabledKeys = createMemo(() => normalizeKeys(props.disabledKeys));

  const getEnabledItems = () =>
    registeredItems().filter(
      (item) =>
        !item.disabled && !disabledKeys().has(item.key) && !isDisabled(),
    );

  const focusItem = (item: ListBoxItemRecord | undefined) => {
    if (!item) return;
    setFocusedKey(item.key);
    item.ref.focus();
  };

  const focusBoundary = (target: ListBoxFocusTarget) => {
    const enabledItems = getEnabledItems();
    if (!enabledItems.length) return;

    if (target === "selected") {
      const selectedItem = enabledItems.find((item) =>
        selectedKeys().has(item.key),
      );
      focusItem(selectedItem ?? enabledItems[0]);
      return;
    }

    focusItem(
      target === "first"
        ? enabledItems[0]
        : enabledItems[enabledItems.length - 1],
    );
  };

  const focusNext = (direction: 1 | -1) => {
    const enabledItems = getEnabledItems();
    if (!enabledItems.length) return;

    const activeElement = document.activeElement;
    let currentIndex = enabledItems.findIndex(
      (item) => item.ref === activeElement,
    );

    if (currentIndex < 0 && focusedKey()) {
      currentIndex = enabledItems.findIndex(
        (item) => item.key === focusedKey(),
      );
    }

    if (currentIndex < 0) {
      focusBoundary(direction === 1 ? "first" : "last");
      return;
    }

    const nextIndex =
      (currentIndex + direction + enabledItems.length) % enabledItems.length;
    focusItem(enabledItems[nextIndex]);
  };

  const updateSelection = (nextKeys: Set<string>) => {
    if (!isControlled()) {
      setInternalSelectedKeys(nextKeys);
    }

    props.onSelectionChange?.(nextKeys);
  };

  const activateKey = (key: string, event: Event) => {
    if (event.defaultPrevented || isDisabled()) return;
    if (disabledKeys().has(key)) return;

    if (selectionMode() === "none") {
      props.onAction?.(key);
      return;
    }

    const current = selectedKeys();

    if (selectionMode() === "single") {
      if (!(current.size === 1 && current.has(key))) {
        updateSelection(new Set([key]));
      }
      props.onAction?.(key);
      return;
    }

    const next = new Set(current);

    if (next.has(key)) {
      if (props.disallowEmptySelection && next.size === 1) {
        props.onAction?.(key);
        return;
      }
      next.delete(key);
    } else {
      next.add(key);
    }

    updateSelection(next);
    props.onAction?.(key);
  };

  const registerItem = (item: ListBoxItemRecord) => {
    setRegisteredItems((current) =>
      sortItemsByDomOrder([
        ...current.filter((entry) => entry.key !== item.key),
        item,
      ]),
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

      const selectedItem = enabledItems.find((item) =>
        selectedKeys().has(item.key),
      );
      const fallback = selectedItem ?? enabledItems[0];

      return fallback?.key === key ? 0 : -1;
    }

    return -1;
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (
    event,
  ) => {
    invokeEventHandler(props.onKeyDown, event);

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
      typeof props.children === "function" &&
      (props.children as (...args: unknown[]) => unknown).length > 0;
    const resolvedStaticChildren =
      typeof props.children === "function"
        ? isItemRenderer
          ? null
          : (props.children as () => JSX.Element)()
        : (props.children ?? null);

    if (props.items) {
      if (props.items.length === 0) {
        return props.renderEmpty?.() ?? null;
      }

      if (isItemRenderer) {
        const renderItem = props.children as (item: unknown) => JSX.Element;
        return <For each={props.items}>{(item) => renderItem(item)}</For>;
      }

      return resolvedStaticChildren;
    }

    return resolvedStaticChildren;
  };

  return (
    <ListBoxContext
      value={{
        variant,
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
        role={props.role ?? "listbox"}
        aria-multiselectable={
          selectionMode() === "multiple" ? "true" : undefined
        }
        aria-disabled={isDisabled() ? "true" : undefined}
        data-slot="listbox"
        data-theme={props.dataTheme}
        data-selection-mode={selectionMode()}
        data-disabled={isDisabled() ? "true" : "false"}
        class={twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          props.class,
        )}
        style={props.style}
        onKeyDown={handleKeyDown}
      >
        {renderChildren()}
      </div>
    </ListBoxContext>
  );
};

export default ListBoxRoot;
export type {
  ListBoxRootProps as ListBoxProps,
  ListBoxSelectionMode,
  ListBoxVariant,
};
export { ListBoxRoot };
