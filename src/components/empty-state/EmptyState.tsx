import { type JSX, type Component, splitProps, createMemo, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import Icon from "../icon";

export type EmptyStateProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> & {
    icon?: string;
    iconSize?: number;
    image?: JSX.Element;
    title?: JSX.Element;
    description?: JSX.Element;
  };

const EmptyState: Component<EmptyStateProps> = (props) => {
  const [local, others] = splitProps(props, [
    "icon",
    "iconSize",
    "image",
    "title",
    "description",
    "dataTheme",
    "class",
    "className",
    "style",
    "children",
  ]);

  const iconSize = () => local.iconSize ?? 48;

  const classes = createMemo(() =>
    twMerge(
      "flex flex-col items-center justify-center gap-3 py-12",
      local.class,
      local.className,
    ),
  );

  return (
    <div
      {...others}
      role="status"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      <Show when={local.image}>{local.image}</Show>
      <Show when={!local.image && local.icon}>
        <Icon name={local.icon} width={iconSize()} height={iconSize()} class="opacity-60" aria-hidden="true" />
      </Show>
      <Show when={local.title}>
        <h3 class="text-lg font-semibold text-base-content/80 text-center">{local.title}</h3>
      </Show>
      <Show when={local.description}>
        <div class="text-sm text-base-content/70">{local.description}</div>
      </Show>
      {local.children}
    </div>
  );
};

export default EmptyState;
