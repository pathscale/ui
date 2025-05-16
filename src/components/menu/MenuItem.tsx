// components/MenuItem.tsx
import {
  type Component,
  splitProps,
  Show,
  createSignal,
  createMemo,
  type JSX,
} from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import { itemVariants, itemDetailWrapper } from "./Menu.styles";
import { Dynamic } from "solid-js/web";

export type MenuItemProps = {
  label: string;
  active?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  to?: string;
  target?: string;
  children?: JSX.Element;
} & VariantProps<typeof itemVariants>
  & ClassProps
  & Omit<JSX.HTMLAttributes<HTMLElement>, "children">;

const MenuItem: Component<MenuItemProps> = (props) => {
  const [local, variantProps, rest] = splitProps(
    props,
    [
      "class",
      "className",
      "label",
      "active",
      "expanded",
      "disabled",
      "tag",
      "to",
      "target",
      "children",
    ],
    Object.keys(itemVariants.variantKeys ?? {}) as any
  );

  const hasChildren = createMemo(() => !!local.children);
  const isControlled = createMemo(() => local.expanded !== undefined);
  const [internalExpanded, setInternalExpanded] = createSignal(false);

  const isExpanded = createMemo(() =>
    isControlled() ? !!local.expanded : internalExpanded()
  );

  const toggleExpand = () => {
    if (!isControlled() && hasChildren() && !local.disabled) {
      setInternalExpanded((prev) => !prev);
    }
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (e) => {
    if (local.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();   // especially prevent page scroll on Space
      toggleExpand();
    }
  };

  // if it's not a link, make it focusable
  const tagName = local.to ? "a" : local.tag ?? "div";
  const focusableProps =
    !local.to && !local.disabled ? { tabIndex: 0 } : {};

  return (
    <Dynamic
      component={tagName}
      class={classes(local.class, local.className, "w-full")}
      href={local.to}
      target={local.target}
      aria-disabled={local.disabled}
      onClick={toggleExpand}
      onKeyDown={onKeyDown}
      {...focusableProps}
      {...rest}
    >
      <div
        class={itemVariants({
          active: !!local.active,
          expanded: isExpanded(),
          disabled: !!local.disabled,
        })}
      >
        <div class="flex items-center justify-between">
          <span>{local.label}</span>
          <Show when={hasChildren()}>
            <span class="ml-2 text-gray-500">
              {isExpanded() ? "▾" : "▸"}
            </span>
          </Show>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class={itemDetailWrapper()}>
          {local.children}
        </div>
      </Show>
    </Dynamic>
  );
};

export default MenuItem;
