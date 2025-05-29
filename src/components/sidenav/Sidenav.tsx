import { type JSX, splitProps, Show, For, createSignal } from "solid-js";
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
  footer?: JSX.Element;
  desktop?: boolean;
  children?: JSX.Element;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type SidenavProps = SidenavBaseProps & IComponentBaseProps;

const Sidenav = (props: SidenavProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "title",
    "items",
    "isOpen",
    "onClose",
    "footer",
    "desktop",
    "children",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(local.isOpen ?? false);

  const isOpen = () => local.isOpen ?? internalOpen();

  const handleClose = () => {
    setInternalOpen(false);
    local.onClose?.();
  };

  const handleOverlayClick = () => {
    if (!local.desktop) {
      handleClose();
    }
  };

  const handleItemClick = (item: SidenavItem) => {
    if (item.onClick) {
      item.onClick();
    }
    // Close sidenav on mobile after item click
    if (!local.desktop) {
      handleClose();
    }
  };

  const sidenavClasses = () =>
    twMerge(
      "sidenav",
      local.class,
      local.className,
      clsx({
        "sidenav-open": isOpen(),
        "sidenav-closed": !isOpen(),
        "sidenav-desktop": local.desktop,
      })
    );

  const overlayClasses = () =>
    twMerge(
      "sidenav-overlay",
      clsx({
        "sidenav-overlay-visible": isOpen(),
        "sidenav-overlay-hidden": !isOpen(),
      })
    );

  return (
    <>
      <Show when={!local.desktop}>
        <div
          class={overlayClasses()}
          onClick={handleOverlayClick}
          {...others}
        />
      </Show>

      <nav
        class={sidenavClasses()}
        data-theme={local.dataTheme}
        style={local.style}
        {...others}
      >
        <Show when={local.title || !local.desktop}>
          <div class="sidenav-header">
            <Show when={local.title}>
              <h2 class="sidenav-title">{local.title}</h2>
            </Show>
            <Show when={!local.desktop}>
              <button
                class="sidenav-close"
                onClick={handleClose}
                aria-label="Close navigation"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Show>
          </div>
        </Show>

        <div class="sidenav-content">
          <Show when={local.items && local.items.length > 0}>
            <ul class="sidenav-menu">
              <For each={local.items}>
                {(item) => {
                  const isGroup = "items" in item;
                  return (
                    <Show
                      when={isGroup}
                      fallback={
                        <li
                          class={clsx("sidenav-item", {
                            "sidenav-item-active": (item as SidenavItem).active,
                          })}
                        >
                          <Show
                            when={(item as SidenavItem).href}
                            fallback={
                              <button
                                type="button"
                                class="sidenav-item-button"
                                onClick={() =>
                                  handleItemClick(item as SidenavItem)
                                }
                              >
                                <Show when={(item as SidenavItem).icon}>
                                  {(item as SidenavItem).icon}
                                </Show>
                                {(item as SidenavItem).label}
                              </button>
                            }
                          >
                            <a
                              href={(item as SidenavItem).href}
                              class="sidenav-item-link"
                              onClick={() =>
                                handleItemClick(item as SidenavItem)
                              }
                            >
                              <Show when={(item as SidenavItem).icon}>
                                {(item as SidenavItem).icon}
                              </Show>
                              {(item as SidenavItem).label}
                            </a>
                          </Show>
                        </li>
                      }
                    >
                      <li class="sidenav-group">
                        <Show when={(item as SidenavItemGroup).label}>
                          <div class="sidenav-group-label">
                            {(item as SidenavItemGroup).label}
                          </div>
                        </Show>
                        <ul class="sidenav-group-items">
                          <For each={(item as SidenavItemGroup).items}>
                            {(groupItem) => (
                              <li
                                class={clsx("sidenav-item", {
                                  "sidenav-item-active": groupItem.active,
                                })}
                              >
                                <Show
                                  when={groupItem.href}
                                  fallback={
                                    <button
                                      type="button"
                                      class="sidenav-item-button"
                                      onClick={() => handleItemClick(groupItem)}
                                    >
                                      <Show when={groupItem.icon}>
                                        {groupItem.icon}
                                      </Show>
                                      {groupItem.label}
                                    </button>
                                  }
                                >
                                  <a
                                    href={groupItem.href}
                                    class="sidenav-item-link"
                                    onClick={() => handleItemClick(groupItem)}
                                  >
                                    <Show when={groupItem.icon}>
                                      {groupItem.icon}
                                    </Show>
                                    {groupItem.label}
                                  </a>
                                </Show>
                              </li>
                            )}
                          </For>
                        </ul>
                      </li>
                    </Show>
                  );
                }}
              </For>
            </ul>
          </Show>

          <Show when={local.children}>
            <div class="sidenav-children">{local.children}</div>
          </Show>
        </div>

        <Show when={local.footer}>
          <div class="sidenav-footer">{local.footer}</div>
        </Show>
      </nav>
    </>
  );
};

export default Sidenav;
