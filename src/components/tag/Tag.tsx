import "./Tag.css";
import {
  Show,
  children,
  createContext,
  createMemo,
  createUniqueId,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import CloseButton, { type CloseButtonProps } from "../close-button";
import type { IComponentBaseProps } from "../types";
import { TagGroupContext } from "../tag-group/context";
import { CLASSES } from "./Tag.classes";

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

export type TagSize = "sm" | "md" | "lg";
export type TagVariant = "default" | "surface";

type TagRenderProps = {
  isSelected: boolean;
  isDisabled: boolean;
  allowsRemoving: boolean;
};

type TagContextValue = {
  allowsRemoving: () => boolean;
  isDisabled: () => boolean;
  removeIcon: () => JSX.Element | undefined;
  remove: (event: Event) => void;
};

const TagContext = createContext<TagContextValue>();

export type TagRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    id?: string | number;
    textValue?: string;
    isDisabled?: boolean;
    size?: TagSize;
    variant?: TagVariant;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
    children?: JSX.Element | ((props: TagRenderProps) => JSX.Element);
  };

export type TagRemoveButtonProps = Omit<CloseButtonProps, "isDisabled"> &
  IComponentBaseProps & {
    isDisabled?: boolean;
  };

const TagRoot: ParentComponent<TagRootProps> = (props) => {
  const fallbackKey = createUniqueId();
  const group = useContext(TagGroupContext);

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
    "textValue",
    "isDisabled",
    "size",
    "variant",
    "startIcon",
    "endIcon",
    "onClick",
    "onKeyDown",
    "role",
    "tabIndex",
  ]);

  const resolvedChildren = children(() => local.children);
  const isRenderFnChild = () => typeof local.children === "function";
  const derivedText = createMemo(() =>
    isRenderFnChild() ? undefined : extractTextValue(resolvedChildren.toArray()),
  );
  const tagKey = createMemo(() => {
    if (local.id != null) return String(local.id);
    if (local.textValue) return toSlug(local.textValue);
    if (derivedText()) return toSlug(derivedText() as string);
    return fallbackKey;
  });

  const size = () => local.size ?? group?.size() ?? "md";
  const variant = () => local.variant ?? group?.variant() ?? "default";
  const isSelectable = () => Boolean(group && group.selectionMode() !== "none");
  const isSelected = () => Boolean(group?.selectedKeys().has(tagKey()));
  const isDisabled = () =>
    Boolean(local.isDisabled) ||
    Boolean(group?.isDisabled()) ||
    Boolean(group?.disabledKeys().has(tagKey()));
  const allowsRemoving = () => Boolean(group?.allowsRemoving()) && Boolean(tagKey());

  const renderState = createMemo<TagRenderProps>(() => ({
    isSelected: isSelected(),
    isDisabled: isDisabled(),
    allowsRemoving: allowsRemoving(),
  }));

  const handleSelect = (event: Event) => {
    if (!group || !isSelectable() || isDisabled()) return;
    group.selectKey(tagKey(), event);
  };

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    handleSelect(event);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;
    if (event.target !== event.currentTarget) return;
    if (!isSelectable() || isDisabled()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleSelect(event);
  };

  const remove = (event: Event) => {
    if (!group || !allowsRemoving() || isDisabled()) return;
    event.preventDefault();
    event.stopPropagation();
    group.removeKey(tagKey(), event);
  };

  return (
    <TagContext.Provider
      value={{
        allowsRemoving,
        isDisabled,
        removeIcon: () => local.endIcon,
        remove,
      }}
    >
      <div
        {...others}
        class={twMerge(
          CLASSES.Root.base,
          CLASSES.Root.size[size()],
          CLASSES.Root.variant[variant()],
          local.class,
          local.className,
        )}
        data-slot="tag"
        data-theme={local.dataTheme}
        data-size={size()}
        data-variant={variant()}
        data-selected={isSelected() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-key={tagKey()}
        aria-selected={isSelectable() ? (isSelected() ? "true" : "false") : undefined}
        aria-disabled={isDisabled() ? "true" : "false"}
        role={local.role ?? (isSelectable() ? "option" : undefined)}
        tabIndex={local.tabIndex ?? (isSelectable() && !isDisabled() ? 0 : undefined)}
        style={local.style}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Show
          when={isRenderFnChild()}
          fallback={
            <>
              <Show when={local.startIcon}>
                <span
                  class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)}
                  data-slot="tag-start-icon"
                >
                  {local.startIcon}
                </span>
              </Show>
              {resolvedChildren()}
              <Show when={allowsRemoving() && local.endIcon}>
                <TagRemoveButton>{local.endIcon}</TagRemoveButton>
              </Show>
              <Show when={!allowsRemoving() && local.endIcon}>
                <span
                  class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)}
                  data-slot="tag-end-icon"
                >
                  {local.endIcon}
                </span>
              </Show>
            </>
          }
        >
          {(local.children as (props: TagRenderProps) => JSX.Element)(renderState())}
        </Show>
      </div>
    </TagContext.Provider>
  );
};

const TagRemoveButton: Component<TagRemoveButtonProps> = (props) => {
  const context = useContext(TagContext);
  const hasIcon = () =>
    props.children != null ||
    props.startIcon != null ||
    props.endIcon != null ||
    context?.removeIcon() != null;
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onClick",
    "isDisabled",
    "aria-label",
  ]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    context?.remove(event);
  };

  if (!context?.allowsRemoving()) return null;
  if (!hasIcon()) return null;

  return (
    <CloseButton
      {...others}
      aria-label={local["aria-label"] ?? "Remove tag"}
      class={twMerge(CLASSES.slot.removeButton, local.class, local.className)}
      data-slot="tag-remove-button"
      data-theme={local.dataTheme}
      style={local.style}
      isDisabled={local.isDisabled ?? context.isDisabled()}
      onClick={handleClick}
    >
      {local.children ?? context.removeIcon()}
    </CloseButton>
  );
};

const Tag = Object.assign(TagRoot, {
  Root: TagRoot,
  RemoveButton: TagRemoveButton,
});

export default Tag;
export { Tag, TagRoot, TagRemoveButton };
export type { TagRootProps as TagProps, TagRenderProps };
