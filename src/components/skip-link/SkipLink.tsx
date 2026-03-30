import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type SkipLinkProps = IComponentBaseProps & {
  href?: string;
  children?: JSX.Element;
} & Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "class" | "className" | "style">;

export default function SkipLink(props: SkipLinkProps) {
  const [local, rest] = splitProps(props, ["href", "children", "class", "className", "style", "dataTheme"]);

  return (
    <a
      href={local.href ?? "#main-content"}
      class={twMerge(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:bg-primary focus:text-primary-content focus:outline-none",
        local.class,
        local.className,
      )}
      style={local.style}
      data-theme={local.dataTheme}
      {...rest}
    >
      {local.children ?? "Skip to main content"}
    </a>
  );
}
