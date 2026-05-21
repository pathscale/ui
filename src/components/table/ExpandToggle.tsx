import { type Component, type JSX, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";

export type ExpandToggleProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> &
  IComponentBaseProps & {
    expanded: boolean;
    onToggle?: () => void;
    size?: number;
    label?: string;
    disabled?: boolean;
  };

const ExpandToggle: Component<ExpandToggleProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "expanded",
    "onToggle",
    "size",
    "label",
    "disabled",
    "class",
    "className",
    "onClick",
    "dataTheme",
  ]);

  const iconSize = () => local.size ?? 16;
  const ariaLabel = () => local.label ?? "Toggle row details";
  const isDisabled = () => Boolean(local.disabled);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    if (typeof local.onClick === "function") {
      local.onClick(event);
    } else if (Array.isArray(local.onClick) && typeof local.onClick[0] === "function") {
      local.onClick[0](local.onClick[1], event);
    }
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    local.onToggle?.();
  };

  return (
    <button
      {...rest}
      type={rest.type ?? "button"}
      {...{ class: twMerge(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content transition-colors hover:bg-base-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        isDisabled() && "cursor-not-allowed opacity-60 hover:bg-base-100",
        local.class,
        local.className,
      ) }}
      data-theme={local.dataTheme}
      data-slot="table-expand-toggle"
      data-expanded={local.expanded ? "true" : "false"}
      aria-expanded={local.expanded}
      aria-label={ariaLabel()}
      disabled={isDisabled()}
      onClick={handleClick}
    >
      <Show
        when={local.expanded}
        fallback={<Icon name="icon-[lucide--chevron-right]" width={iconSize()} height={iconSize()} aria-hidden="true" />}
      >
        <Icon name="icon-[lucide--chevron-down]" width={iconSize()} height={iconSize()} aria-hidden="true" />
      </Show>
    </button>
  );
};

export default ExpandToggle;
