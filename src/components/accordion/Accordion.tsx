import { clsx } from "clsx";
import { createMemo, createSignal, createUniqueId, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import { CollapseContent, CollapseTitle } from "../collapse";
import type { IComponentBaseProps } from "../types";

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
  // ARIA attributes
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
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
    "aria-label",
    "aria-describedby",
    "aria-labelledby",
  ]);

  const [isExpanded, setIsExpanded] = createSignal(local.expanded || false);
  const uniqueId = createUniqueId();
  const contentId = `accordion-content-${uniqueId}`;
  const titleId = `accordion-title-${uniqueId}`;

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
    <div
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
      role="region"
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-labelledby={local["aria-labelledby"] || titleId}
    >
      {local.mode !== "controlled" && (
        <input
          type={local.mode === "checkbox" ? "checkbox" : "radio"}
          name={local.name ?? "accordion"}
          checked={expanded()}
          onChange={handleToggle}
          aria-expanded={expanded()}
          aria-controls={contentId}
          {...others}
        />
      )}
      {local.mode === "controlled" && (
        <div
          class="hidden"
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          aria-expanded={expanded()}
          aria-controls={contentId}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        />
      )}
      {local.children}
    </div>
  );
};

const AccordionTitle = CollapseTitle;

const AccordionContent = CollapseContent;

Accordion.Title = AccordionTitle;
Accordion.Content = AccordionContent;

export default Accordion;
