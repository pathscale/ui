import { splitProps, type JSX, createSignal, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";
import { CollapseTitle, CollapseContent } from "../collapse";

type AccordionBaseProps = {
  name?: string;
  icon?: "arrow" | "plus";
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  mode?: "radio" | "checkbox" | "controlled";
  expanded?: boolean;
  onToggle?: () => void;
};

export type AccordionProps = AccordionBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof AccordionBaseProps>;

const Accordion = (props: AccordionProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "name",
    "icon",
    "dataTheme",
    "class",
    "className",
    "style",
    "mode",
    "expanded",
    "onToggle",
    "children",
  ]);

  const [isExpanded, setIsExpanded] = createSignal(local.expanded || false);

  const isControlled = createMemo(
    () => local.mode === "controlled" || local.expanded !== undefined
  );
  const expanded = createMemo(() =>
    isControlled() ? local.expanded : isExpanded()
  );

  const handleToggle = () => {
    if (!isControlled()) {
      setIsExpanded(!isExpanded());
    }
    if (local.onToggle) {
      local.onToggle();
    }
  };

  const classes = () =>
    twMerge(
      "collapse",
      clsx({
        "collapse-arrow": local.icon === "arrow",
        "collapse-plus": local.icon === "plus",
        "collapse-open": expanded(),
        "collapse-close": !expanded(),
      }),
      local.class,
      local.className
    );

  return (
    <div class={classes()} data-theme={local.dataTheme} style={local.style}>
      {local.mode !== "controlled" && (
        <input
          type={local.mode === "checkbox" ? "checkbox" : "radio"}
          name={local.name ?? "accordion"}
          checked={expanded()}
          onChange={handleToggle}
          {...others}
        />
      )}
      {local.mode === "controlled" && (
        <div class="hidden" onClick={handleToggle} />
      )}
      {local.children}
    </div>
  );
};

Accordion.Title = CollapseTitle;
Accordion.Content = CollapseContent;

export default Accordion;
