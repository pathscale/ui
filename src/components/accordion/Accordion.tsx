import { clsx } from "clsx";
import {
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
  type JSX,
  children as resolveChildren,
  createEffect,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import { CollapseContent, CollapseTitle } from "../collapse";
import type { IComponentBaseProps } from "../types";

type AccordionBaseProps = {
  name?: string;
  icon?: "arrow" | "plus";
  checked?: boolean;
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

const accordionGroups = new Map<string, Set<() => void>>();

const Accordion = (props: AccordionProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "name",
    "icon",
    "checked",
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

  const uniqueId = createUniqueId();
  const contentId = `accordion-content-${uniqueId}`;
  const titleId = `accordion-title-${uniqueId}`;
  const isControlled = createMemo(() => local.mode === "controlled");

  const [isExpanded, setIsExpanded] = createSignal(
    local.checked || local.expanded || false
  );

  const expanded = createMemo(() => {
    if (isControlled()) {
      return local.expanded ?? false;
    }
    return isExpanded();
  });

  const groupName = () => local.name ?? "accordion";
  const isRadioMode = () =>
    local.mode !== "checkbox" && local.mode !== "controlled";

  const closeAccordion = () => {
    if (!isControlled()) {
      setIsExpanded(false);
    }
  };

  createEffect(() => {
    if (isRadioMode()) {
      const name = groupName();

      if (!accordionGroups.has(name)) {
        accordionGroups.set(name, new Set());
      }

      const group = accordionGroups.get(name)!;
      group.add(closeAccordion);

      return () => {
        group.delete(closeAccordion);
        if (group.size === 0) {
          accordionGroups.delete(name);
        }
      };
    }
  });

  const handleToggle = () => {
    const wasExpanded = expanded();

    if (!isControlled()) {
      if (isRadioMode() && !wasExpanded) {
        const group = accordionGroups.get(groupName());
        if (group) {
          group.forEach((closeFunc) => {
            if (closeFunc !== closeAccordion) {
              closeFunc();
            }
          });
        }
        setIsExpanded(true);
      } else if (local.mode === "checkbox") {
        setIsExpanded(!wasExpanded);
      } else if (isRadioMode() && wasExpanded) {
        setIsExpanded(false);
      }
    }
    local.onToggle?.();
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

  const resolvedChildren = resolveChildren(() => local.children);

  const childrenWithAria = createMemo(() => {
    const children = resolvedChildren();
    const arr = Array.isArray(children) ? children : [children];
    return arr.map((child) => {
      if (child == null || typeof child !== "object" || !("props" in child))
        return child;

      if (
        child.props &&
        typeof child.props === "object" &&
        "class" in child.props &&
        typeof child.props.class === "string" &&
        child.props.class.includes("collapse-title")
      ) {
        return {
          ...child,
          props: {
            ...child.props,
            id: titleId,
            role: "button",
            tabIndex: 0,
            "aria-expanded": expanded(),
            "aria-controls": contentId,
            onClick: handleToggle,
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle();
              }
              const origOnKeyDown =
                child.props &&
                (child.props as { onKeyDown?: (e: KeyboardEvent) => void })
                  .onKeyDown;
              if (typeof origOnKeyDown === "function") {
                origOnKeyDown(e);
              }
            },
          },
        };
      }

      if (
        child.props &&
        typeof child.props === "object" &&
        "class" in child.props &&
        typeof child.props.class === "string" &&
        child.props.class.includes("collapse-content")
      ) {
        return {
          ...child,
          props: {
            ...child.props,
            id: contentId,
          },
        };
      }

      return child;
    });
  });

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
          name={groupName()}
          checked={expanded()}
          onChange={handleToggle}
          aria-expanded={expanded()}
          aria-controls={contentId}
          aria-checked={
            local.mode === "checkbox" || local.mode === "radio"
              ? expanded()
              : undefined
          }
          {...others}
        />
      )}
      {childrenWithAria()}
    </div>
  );
};

const AccordionTitle = CollapseTitle;
const AccordionContent = CollapseContent;

Accordion.Title = AccordionTitle;
Accordion.Content = AccordionContent;

export default Accordion;
