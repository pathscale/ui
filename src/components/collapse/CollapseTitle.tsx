import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CollapseTitleProps<T extends HTMLElement = HTMLDivElement> =
  JSX.HTMLAttributes<T> & IComponentBaseProps;

const TITLE_PART = "title";

export const classesFn = ({ className }: { className?: string }) =>
  twMerge("collapse-title", className);

export function CollapseTitle(props: CollapseTitleProps): JSX.Element {
  const [local, others] = splitProps(props, ["class", "onClick"]);

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    event,
  ) => {
    const titleNode = event.currentTarget;
    const root = titleNode.closest(".collapse");
    const toggleInput = root?.querySelector<HTMLInputElement>(
      ':scope > input[type="checkbox"], :scope > input[type="radio"]',
    );

    if (toggleInput) {
      toggleInput.click();
    }

    if (typeof local.onClick === "function") {
      local.onClick(event);
    }
  };

  return (
    <div
      {...others}
      data-collapse-part={TITLE_PART}
      class={classesFn({ className: local.class })}
      onClick={handleClick}
    />
  );
}

export type SummaryProps = JSX.HTMLAttributes<HTMLElement> &
  IComponentBaseProps;

export function Summary(props: SummaryProps): JSX.Element {
  return (
    <summary
      {...props}
      data-collapse-part={TITLE_PART}
      class={classesFn({ className: props.class })}
    />
  );
}
