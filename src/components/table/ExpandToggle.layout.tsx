import {type Component, Show, omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import Icon from "../icon";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { tableExpandToggleRecipe } from "./Table.recipe";

export type ExpandToggleProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> &
  UIBaseProps & {
    expanded: boolean;
    onToggle?: () => void;
    size?: number;
    label?: string;
    disabled?: boolean;
  };

const ExpandToggle: Layout<typeof tableExpandToggleRecipe, ExpandToggleProps> = () => {
  const rest = omit(
    props,
    "expanded",
    "onToggle",
    "size",
    "label",
    "disabled",
    "class",
    "onClick",
    "dataTheme",
  );

  const iconSize = () => props.size ?? 16;
  const ariaLabel = () => props.label ?? "Toggle row details";
  const isDisabled = () => Boolean(props.disabled);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    if (typeof props.onClick === "function") {
      props.onClick(event);
    } else if (Array.isArray(props.onClick) && typeof props.onClick[0] === "function") {
      props.onClick[0](props.onClick[1], event);
    }
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    props.onToggle?.();
  };

  return (
    <button
      {...rest}
      type={rest.type ?? "button"}
      {...{ class: twMerge(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content transition-colors hover:bg-base-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        isDisabled() && "cursor-not-allowed opacity-60 hover:bg-base-100",
        props.class,
      ) }}
      data-theme={props.dataTheme}
      data-slot="table-expand-toggle"
      data-expanded={props.expanded ? "true" : "false"}
      aria-expanded={props.expanded ? "true" : "false"}
      aria-label={ariaLabel()}
      disabled={isDisabled()}
      onClick={handleClick}
    >
      <Show
        when={props.expanded}
        fallback={<Icon src="icon-[lucide--chevron-right]" width={iconSize()} height={iconSize()} aria-hidden="true" />}
      >
        <Icon src="icon-[lucide--chevron-down]" width={iconSize()} height={iconSize()} aria-hidden="true" />
      </Show>
    </button>
  );
};

export default ExpandToggle;
