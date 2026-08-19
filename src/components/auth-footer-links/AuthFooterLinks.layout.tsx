import "./AuthFooterLinks.css";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import type { authFooterLinks } from "./AuthFooterLinks.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthFooterLinkItem = {
  key: string;
  label: JSX.Element | string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type AuthFooterLinksAlign = "left" | "center" | "right";

export type AuthFooterLinksProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    items: AuthFooterLinkItem[];
    align?: AuthFooterLinksAlign;
  };

/* -------------------------------------------------------------------------------------------------
 * AuthFooterLinks
 *
 * An item with an href is an anchor and an item without one is a button, so a
 * link that navigates keeps middle-click and "open in new tab" while a link
 * that only runs a handler stays a real button for assistive technology.
 * Disabled state is mirrored to `data-disabled` rather than composed into the
 * class string, so the recipe keeps ownership of presentation.
 * -----------------------------------------------------------------------------------------------*/
export const AuthFooterLinksLayout: Layout<
  typeof authFooterLinks,
  AuthFooterLinksProps
> = () => (
  <div {...slot.root}>
    <For each={local.items}>
      {(item) =>
        item.href ? (
          <a
            {...slot.link}
            href={item.href}
            data-disabled={item.disabled ? "true" : "false"}
            aria-disabled={item.disabled ? "true" : undefined}
            onClick={(event) => {
              if (item.disabled) {
                event.preventDefault();
                return;
              }
              item.onClick?.();
            }}
          >
            {item.label}
          </a>
        ) : (
          <button
            {...slot.link}
            type="button"
            data-disabled={item.disabled ? "true" : "false"}
            disabled={item.disabled}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        )
      }
    </For>
  </div>
);
