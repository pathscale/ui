import "./TagGroup.css";
import {
  For,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import type { TagSize, TagVariant } from "../tag";
import { TagGroupContext, type TagSelectionMode } from "./context";

const normalizeKeys = (keys?: Iterable<string | number>): Set<string> => {
  if (!keys) return new Set();
  return new Set(Array.from(keys, (key) => String(key)));
};

export type TagGroupRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    size?: TagSize;
    variant?: TagVariant;
    selectionMode?: TagSelectionMode;
    selectedKeys?: Iterable<string | number>;
    defaultSelectedKeys?: Iterable<string | number>;
    disabledKeys?: Iterable<string | number>;
    onSelectionChange?: (keys: Set<string>) => void;
    onRemove?: (keys: Set<string>) => void;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type TagGroupListProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((item: unknown) => JSX.Element);
    items?: readonly unknown[];
    renderEmptyState?: () => JSX.Element;
  };

const TagGroupRoot: ParentComponent<TagGroupRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "size",
    "variant",
    "selectionMode",
    "selectedKeys",
    "defaultSelectedKeys",
    "disabledKeys",
    "onSelectionChange",
    "onRemove",
    "isDisabled",
    "disabled",
    "role",
  ]);

  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<Set<string>>(
    normalizeKeys(local.defaultSelectedKeys),
  );

  const selectionMode = () => local.selectionMode ?? "none";
  const size = () => local.size ?? "md";
  const variant = () => local.variant ?? "default";
  const isControlled = () => local.selectedKeys !== undefined;
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const selectedKeys = createMemo(() =>
    isControlled() ? normalizeKeys(local.selectedKeys) : internalSelectedKeys(),
  );
  const disabledKeys = createMemo(() => normalizeKeys(local.disabledKeys));
  const allowsRemoving = () => typeof local.onRemove === "function";

  const updateSelection = (nextKeys: Set<string>) => {
    if (!isControlled()) {
      setInternalSelectedKeys(nextKeys);
    }
    local.onSelectionChange?.(nextKeys);
  };

  const selectKey = (key: string, event: Event) => {
    if (event.defaultPrevented || isDisabled() || disabledKeys().has(key)) return;
    if (selectionMode() === "none") return;

    const current = selectedKeys();
    let next: Set<string>;

    if (selectionMode() === "single") {
      if (current.has(key) && current.size === 1) return;
      next = new Set([key]);
    } else {
      next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
    }

    updateSelection(next);
  };

  const removeKey = (key: string, event: Event) => {
    if (event.defaultPrevented || isDisabled()) return;

    local.onRemove?.(new Set([key]));

    if (selectedKeys().has(key)) {
      const next = new Set(selectedKeys());
      next.delete(key);
      updateSelection(next);
    }
  };

  return (
    <TagGroupContext.Provider
      value={{
        size,
        variant,
        selectionMode,
        selectedKeys,
        disabledKeys,
        isDisabled,
        allowsRemoving,
        selectKey,
        removeKey,
      }}
    >
      <div
        {...others}
        role={local.role ?? "group"}
        data-slot="tag-group"
        data-theme={local.dataTheme}
        data-size={size()}
        data-variant={variant()}
        data-selection-mode={selectionMode()}
        data-disabled={isDisabled() ? "true" : "false"}
        aria-disabled={isDisabled() ? "true" : undefined}
        class={twMerge("tag-group", local.class, local.className)}
        style={local.style}
      >
        {local.children}
      </div>
    </TagGroupContext.Provider>
  );
};

const TagGroupList: Component<TagGroupListProps> = (props) => {
  const group = useContext(TagGroupContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "items",
    "renderEmptyState",
    "role",
  ]);

  const renderChildren = (): JSX.Element => {
    if (local.items) {
      if (local.items.length === 0) {
        return local.renderEmptyState?.() ?? null;
      }

      if (typeof local.children === "function") {
        const renderItem = local.children as (item: unknown) => JSX.Element;
        return <For each={local.items}>{(item) => renderItem(item)}</For>;
      }

      return local.children ?? null;
    }

    return typeof local.children === "function" ? null : (local.children ?? null);
  };

  return (
    <div
      {...others}
      role={local.role ?? (group?.selectionMode() === "none" ? "list" : "listbox")}
      aria-multiselectable={group?.selectionMode() === "multiple" ? "true" : undefined}
      data-slot="tag-group-list"
      data-theme={local.dataTheme}
      class={twMerge("tag-group__list", local.class, local.className)}
      style={local.style}
    >
      {renderChildren()}
    </div>
  );
};

const TagGroup = Object.assign(TagGroupRoot, {
  Root: TagGroupRoot,
  List: TagGroupList,
});

export default TagGroup;
export { TagGroup, TagGroupRoot, TagGroupList };
export type { TagGroupRootProps as TagGroupProps };
