import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Card from "../card";
import type { IComponentBaseProps } from "../types";

export type AuthCardProps = IComponentBaseProps & {
  title?: JSX.Element;
  description?: JSX.Element;
  children: JSX.Element;
  footer?: JSX.Element;
  brandingSlot?: JSX.Element;
  bodyClass?: string;
};

const AuthCard: Component<AuthCardProps> = (props) => {
  const [local, others] = splitProps(props, [
    "title",
    "description",
    "children",
    "footer",
    "brandingSlot",
    "bodyClass",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <Card
      {...others}
      variant="shadow"
      {...{ class: twMerge("w-full max-w-md", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="auth-card"
    >
      <Card.Body class={twMerge("gap-5", local.bodyClass)}>
        <Show when={local.title || local.description || local.brandingSlot}>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <Show when={local.title}>
                <h2 class="text-xl font-semibold leading-tight">{local.title}</h2>
              </Show>
              <Show when={local.description}>
                <p class="text-sm opacity-70">{local.description}</p>
              </Show>
            </div>
            <Show when={local.brandingSlot}>
              <div class="shrink-0">{local.brandingSlot}</div>
            </Show>
          </div>
        </Show>

        {local.children}
      </Card.Body>

      <Show when={local.footer}>
        <Card.Footer class="justify-start">
          {local.footer}
        </Card.Footer>
      </Show>
    </Card>
  );
};

export default AuthCard;
