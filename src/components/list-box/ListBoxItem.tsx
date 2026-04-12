import {
  createEffect,
  createContext,
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
import { ListBoxContext, type ListBoxVariant } from "./context";
import { CLASSES } from "./ListBox.classes";

type ListBoxItemRenderProps = {
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
};

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

type ListBoxItemContextValue = {
  renderState: () => ListBoxItemRenderProps;
};

const ListBoxItemContext = createContext<ListBoxItemContextValue>();

export type ListBoxItemRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    id?: string | number;
    textValue?: string;
    variant?: ListBoxVariant;
    isDisabled?: boolean;
    disabled?: boolean;
    children?: JSX.Element | ((props: ListBoxItemRenderProps) => JSX.Element);
  };

export type ListBoxItemIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: ListBoxItemRenderProps) => JSX.Element);
  };

const ListBoxItemRoot: ParentComponent<ListBoxItemRootProps> = (props) => {
  const listBox = useContext(ListBoxContext);
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

  const variant = () => local.variant ?? listBox?.variant() ?? "default";
  const isSelectable = () => (listBox?.selectionMode() ?? "none") !== "none";
  const isSelected = () => listBox?.isSelected(key()) ?? false;
  const isFocused = () => listBox?.focusedKey() === key();
  const isDisabled = () =>
    listBox?.isItemDisabled(key(), Boolean(local.isDisabled) || Boolean(local.disabled)) ??
    (Boolean(local.isDisabled) || Boolean(local.disabled));

  const renderState = createMemo<ListBoxItemRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isDisabled: isDisabled(),
  }));

  const resolvedTabIndex = () => {
    if (local.tabIndex !== undefined) return local.tabIndex;
    if (!listBox) return isDisabled() ? -1 : 0;
    return listBox.getItemTabIndex(key(), isDisabled());
  };

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented || isDisabled()) return;
    listBox?.activateKey(key(), event);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      listBox?.focusNext(1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      listBox?.focusNext(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      listBox?.focusBoundary("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      listBox?.focusBoundary("last");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      listBox?.activateKey(key(), event);
    }
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocus, event);
    if (event.defaultPrevented) return;
    listBox?.setFocusedKey(key());
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onBlur, event);
    if (event.defaultPrevented) return;

    if (listBox?.focusedKey() === key()) {
      listBox.setFocusedKey(undefined);
    }
  };

  createEffect(() => {
    if (!listBox || !itemRef) return;

    listBox.registerItem({
      key: key(),
      disabled: Boolean(local.isDisabled) || Boolean(local.disabled),
      ref: itemRef,
    });
  });

  onCleanup(() => {
    if (!listBox) return;
    listBox.unregisterItem(key());
  });

  return (
    <ListBoxItemContext.Provider value={{ renderState }}>
      <div
        {...others}
        ref={(node) => {
          itemRef = node;
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        role={local.role ?? "option"}
        tabIndex={resolvedTabIndex()}
        aria-selected={isSelectable() ? (isSelected() ? "true" : "false") : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-slot="listbox-item"
        data-theme={local.dataTheme}
        data-disabled={isDisabled() ? "true" : "false"}
        data-selected={isSelected() ? "true" : "false"}
        data-focus={isFocused() ? "true" : "false"}
        data-key={key()}
        class={twMerge(
          CLASSES.Item.base,
          CLASSES.Item.variant[variant()],
          local.class,
          local.className,
        )}
        style={local.style}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {typeof local.children === "function"
          ? (local.children as (props: ListBoxItemRenderProps) => JSX.Element)(renderState())
          : local.children}
      </div>
    </ListBoxItemContext.Provider>
  );
};

const ListBoxItemIndicator: Component<ListBoxItemIndicatorProps> = (props) => {
  const context = useContext(ListBoxItemContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const renderState = () =>
    context?.renderState() ?? {
      isSelected: false,
      isFocused: false,
      isDisabled: false,
    };

  return (
    <span
      {...others}
      aria-hidden="true"
      data-slot="listbox-item-indicator"
      data-theme={local.dataTheme}
      data-visible={renderState().isSelected ? "true" : undefined}
      class={twMerge(CLASSES.ItemIndicator.base, local.class, local.className)}
      style={local.style}
    >
      {typeof local.children === "function" ? (
        (local.children as (props: ListBoxItemRenderProps) => JSX.Element)(renderState())
      ) : local.children ? (
        local.children
      ) : (
        <svg
          aria-hidden="true"
          data-slot="listbox-item-indicator--checkmark"
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

const ListBoxItem = Object.assign(ListBoxItemRoot, {
  Root: ListBoxItemRoot,
  Indicator: ListBoxItemIndicator,
});

export default ListBoxItem;
export { ListBoxItem, ListBoxItemRoot, ListBoxItemIndicator };
export type {
  ListBoxItemRootProps as ListBoxItemProps,
  ListBoxItemRenderProps,
  ListBoxVariant,
};
