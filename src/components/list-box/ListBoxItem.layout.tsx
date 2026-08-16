import {createEffect, createContext, createMemo, createUniqueId, onCleanup, omit, useContext, type Component, type ParentComponent} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps, State } from "../vocabulary";
import { ListBoxContext, type ListBoxVariant } from "./context";
import { CLASSES } from "./ListBox.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ListBox.recipe";

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

/*
 * A default, not an empty context.
 *
 * Solid 2's `useContext` throws when the resolved value is `undefined`, where
 * 1.9 returned it, so a context with no default turns every standalone use of
 * an indicator into a crash at render. The reader already had this exact
 * fallback inline; it lives here now, where one declaration answers for every
 * reader instead of each one repeating it.
 */
const ListBoxItemContext = createContext<ListBoxItemContextValue>({
  renderState: () => ({ isSelected: false, isFocused: false, isDisabled: false }),
});

export type ListBoxItemRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    id?: string | number;
    textValue?: string;
    variant?: ListBoxVariant;
    state?: State;
    disabled?: boolean;
    children?: JSX.Element | ((props: ListBoxItemRenderProps) => JSX.Element);
  };

export type ListBoxItemIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element | ((props: ListBoxItemRenderProps) => JSX.Element);
  };

const ListBoxItemRoot: Layout<typeof componentRecipe, ListBoxItemRootProps> = () => {
  const listBox = useContext(ListBoxContext);
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

  const variant = () => props.variant ?? listBox?.variant() ?? "default";
  const isSelectable = () => (listBox?.selectionMode() ?? "none") !== "none";
  const isSelected = () => listBox?.isSelected(key()) ?? false;
  const isFocused = () => listBox?.focusedKey() === key();
  const isDisabled = () =>
    listBox?.isItemDisabled(key(), Boolean((props.state === "disabled")) || Boolean(props.disabled)) ??
    (Boolean((props.state === "disabled")) || Boolean(props.disabled));

  const renderState = createMemo<ListBoxItemRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isDisabled: isDisabled(),
  }));

  const resolvedTabIndex = () => {
    if (props.tabindex !== undefined) return props.tabindex;
    if (!listBox) return isDisabled() ? -1 : 0;
    return listBox.getItemTabIndex(key(), isDisabled());
  };

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented || isDisabled()) return;
    listBox?.activateKey(key(), event);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
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
    invokeEventHandler(props.onFocus, event);
    if (event.defaultPrevented) return;
    listBox?.setFocusedKey(key());
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(props.onBlur, event);
    if (event.defaultPrevented) return;

    if (listBox?.focusedKey() === key()) {
      listBox.setFocusedKey(undefined);
    }
  };

  createEffect(() => {
    if (!listBox || !itemRef) return;

    listBox.registerItem({
      key: key(),
      disabled: Boolean((props.state === "disabled")) || Boolean(props.disabled),
      ref: itemRef,
    });
  });

  onCleanup(() => {
    if (!listBox) return;
    listBox.unregisterItem(key());
  });

  return (
    <ListBoxItemContext value={{ renderState }}>
      <div
        {...others}
        ref={(node) => {
          itemRef = node;
          if (typeof props.ref === "function") {
            props.ref(node);
          }
        }}
        role={props.role ?? "option"}
        tabindex={resolvedTabIndex()}
        aria-selected={isSelectable() ? (isSelected() ? "true" : "false") : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-slot="listbox-item"
        data-theme={props.dataTheme}
        data-disabled={isDisabled() ? "true" : "false"}
        data-selected={isSelected() ? "true" : "false"}
        data-focus={isFocused() ? "true" : "false"}
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
          ? (props.children as (props: ListBoxItemRenderProps) => JSX.Element)(renderState())
          : props.children}
      </div>
    </ListBoxItemContext>
  );
};

const ListBoxItemIndicator: Layout<typeof componentRecipe, ListBoxItemIndicatorProps> = () => {
  const context = useContext(ListBoxItemContext);
  const others = omit(props, "children", "class", "dataTheme", "style");

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
      data-theme={props.dataTheme}
      data-visible={renderState().isSelected ? "true" : undefined}
      {...{ class: twMerge(CLASSES.ItemIndicator.base, props.class) }}
      style={props.style}
    >
      {typeof props.children === "function" ? (
        (props.children as (props: ListBoxItemRenderProps) => JSX.Element)(renderState())
      ) : props.children ? (
        props.children
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
