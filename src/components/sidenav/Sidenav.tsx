import { type JSX, splitProps, Show, For } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

export interface SidenavItem {
  id: string;
  label: string;
  href?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  active?: boolean;
}

export interface SidenavItemGroup {
  label?: string;
  items: SidenavItem[];
}

type SidenavBaseProps = {
  title?: string;
  items?: (SidenavItem | SidenavItemGroup)[];
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  children?: JSX.Element;
  footer?: JSX.Element;
  class?: string;
};

export type SidenavProps = SidenavBaseProps & IComponentBaseProps;

const Sidenav = (props: SidenavProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "title",
    "items",
    "isOpen",
    "onClose",
    "collapsed",
    "children",
    "footer",
    "class",
  ]);

  const handleItemClick = (item: SidenavItem) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  const sidenavClasses = () =>
    twMerge(
      "sidenav",
      local.class,
      clsx({
        "sidenav-collapsed": local.collapsed,
        "sidenav-closed": !local.isOpen,
      })
    );

  const renderItem = (item: SidenavItem) => (
    <li
      class={clsx("sidenav-item", {
        "sidenav-item-active": item.active,
      })}
    >
      <Show
        when={item.href}
        fallback={
          <button
            type="button"
            class="sidenav-item-button"
            onClick={() => handleItemClick(item)}
            title={local.collapsed ? item.label : undefined}
          >
            {item.icon}
            <Show when={!local.collapsed}>
              <span class="sidenav-item-label">{item.label}</span>
            </Show>
          </button>
        }
      >
        <a
          href={item.href}
          class="sidenav-item-link"
          onClick={() => handleItemClick(item)}
          title={local.collapsed ? item.label : undefined}
        >
          {item.icon}
          <Show when={!local.collapsed}>
            <span class="sidenav-item-label">{item.label}</span>
          </Show>
        </a>
      </Show>
    </li>
  );

  const renderGroup = (group: SidenavItemGroup) => {
    if (local.collapsed) {
      return (
        <div class="sidenav-group">
          <For each={group.items}>{(groupItem) => renderItem(groupItem)}</For>
        </div>
      );
    }

    return (
      <div class="sidenav-group">
        <Show when={group.label}>
          <div class="sidenav-group-label">{group.label}</div>
        </Show>
        <ul class="sidenav-group-items">
          <For each={group.items}>{(groupItem) => renderItem(groupItem)}</For>
        </ul>
      </div>
    );
  };

  return (
    <nav class={sidenavClasses()} {...others}>
      <Show when={local.title && !local.collapsed}>
        <div class="sidenav-header">
          <h2 class="sidenav-title">{local.title}</h2>
        </div>
      </Show>

      <div class="sidenav-content">
        <Show when={local.items && local.items.length > 0}>
          <ul class="sidenav-menu">
            <For each={local.items}>
              {(item) => {
                const isGroup = "items" in item;
                if (!isGroup) {
                  return renderItem(item as SidenavItem);
                }
                return renderGroup(item as SidenavItemGroup);
              }}
            </For>
          </ul>
        </Show>

        <Show when={local.children && !local.collapsed}>
          <div class="sidenav-children">{local.children}</div>
        </Show>
      </div>

      <Show when={local.footer}>
        <div class="sidenav-footer">{local.footer}</div>
      </Show>
    </nav>
  );
};

export default Sidenav;
