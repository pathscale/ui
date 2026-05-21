import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type AuthPoweredByProps = IComponentBaseProps & {
  label?: string;
  logo?: JSX.Element;
  href?: string;
  align?: "center" | "left" | "right";
  variant?: "subtle" | "card" | "inline";
};

const ALIGN_CLASS: Record<NonNullable<AuthPoweredByProps["align"]>, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

const VARIANT_CLASS: Record<NonNullable<AuthPoweredByProps["variant"]>, string> = {
  subtle: "text-xs opacity-70",
  card: "rounded-md border border-base-300 px-2.5 py-1 text-xs",
  inline: "text-sm",
};

const AuthPoweredBy: Component<AuthPoweredByProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "logo",
    "href",
    "align",
    "variant",
    "class",
    "className",
    "dataTheme",
  ]);

  const label = () => local.label ?? "Powered by Honey.id";

  const content = () => (
    <span class="inline-flex items-center gap-1.5">
      <Show when={local.logo}>
        <span class="inline-flex shrink-0" aria-hidden="true">
          {local.logo}
        </span>
      </Show>
      <span>{label()}</span>
    </span>
  );

  return (
    <div
      {...others}
      {...{ class: twMerge(
        "flex w-full",
        ALIGN_CLASS[local.align ?? "center"],
        VARIANT_CLASS[local.variant ?? "subtle"],
        local.class,
        local.className,
      ) }}
      data-theme={local.dataTheme}
      data-slot="auth-powered-by"
    >
      <Show
        when={local.href}
        fallback={content()}
      >
        <a href={local.href} class="underline-offset-4 transition hover:underline">
          {content()}
        </a>
      </Show>
    </div>
  );
};

export default AuthPoweredBy;
