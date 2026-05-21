import { For, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type AuthFooterLinkItem = {
  key: string;
  label: JSX.Element | string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type AuthFooterLinksProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    items: AuthFooterLinkItem[];
    align?: "left" | "center" | "right";
  };

const ALIGN_CLASS: Record<NonNullable<AuthFooterLinksProps["align"]>, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

const AuthFooterLinks: Component<AuthFooterLinksProps> = (props) => {
  const [local, others] = splitProps(props, [
    "items",
    "align",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(
        "flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-sm",
        ALIGN_CLASS[local.align ?? "center"],
        local.class,
        local.className,
      ) }}
      data-theme={local.dataTheme}
      data-slot="auth-footer-links"
    >
      <For each={local.items}>
        {(item) =>
          item.href ? (
            <a
              href={item.href}
              onClick={(event) => {
                if (item.disabled) {
                  event.preventDefault();
                  return;
                }
                item.onClick?.();
              }}
              aria-disabled={item.disabled ? "true" : undefined}
              class={twMerge(
                "underline-offset-4 transition hover:underline",
                item.disabled ? "pointer-events-none opacity-50" : "text-primary hover:text-accent",
              )}
            >
              {item.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              class={twMerge(
                "underline-offset-4 transition hover:underline",
                item.disabled ? "cursor-not-allowed opacity-50" : "text-primary hover:text-accent",
              )}
            >
              {item.label}
            </button>
          )
        }
      </For>
    </div>
  );
};

export default AuthFooterLinks;
