import { type JSX, Show } from "solid-js";

import type { IComponentBaseProps } from "../types";
import {
  accordionBody,
  accordionBodyInner,
  accordionContent,
  accordionIndicator,
  accordionItem,
  accordionRoot,
  accordionTrigger,
} from "./Accordion.classes";
import {
  AccordionContext,
  AccordionItemContext,
  type AccordionItemModel,
  type AccordionRootModel,
  type AccordionTriggerModel,
} from "./useAccordion";

/**
 * Accordion's markup, and nothing else.
 *
 * Every value here arrives already decided: the models come from
 * `useAccordion.ts`, the class strings from the recipes in
 * `Accordion.classes.ts`. There is no state, no event logic, and no class
 * composition in this file, so the shape of the DOM can be read straight down
 * the page the way a `<template>` block reads.
 *
 * The rule that keeps it that way: nothing in here may compute. If a value
 * needs deciding, it is decided in the model.
 */

type LayoutProps<Model, Element> = {
  model: Model;
  base: IComponentBaseProps;
  others: JSX.HTMLAttributes<Element>;
  children?: JSX.Element;
};

export function AccordionRootLayout(
  props: LayoutProps<AccordionRootModel, HTMLDivElement>,
): JSX.Element {
  return (
    <AccordionContext.Provider value={props.model.context}>
      <div
        {...props.others}
        ref={props.model.setRootRef}
        class={accordionRoot({
          variant: props.model.variant(),
          class: props.base.class,
          className: props.base.className,
        })}
        data-slot="accordion"
        data-selection-mode={props.model.selectionMode()}
        data-hide-separator={props.model.hideSeparator() ? "true" : undefined}
        data-variant={props.model.variant()}
        data-disabled={props.model.isDisabled() ? "true" : "false"}
        data-theme={props.base.dataTheme}
        style={props.base.style}
        aria-disabled={props.model.isDisabled() ? "true" : undefined}
      >
        {props.children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItemLayout(
  props: LayoutProps<AccordionItemModel, HTMLDivElement>,
): JSX.Element {
  return (
    <AccordionItemContext.Provider value={props.model.context}>
      <div
        {...props.others}
        class={accordionItem({
          expanded: props.model.isExpanded(),
          disabled: props.model.isDisabled(),
          hideSeparator: props.model.hideSeparator(),
          class: props.base.class,
          className: props.base.className,
        })}
        data-slot="accordion-item"
        data-expanded={props.model.isExpanded() ? "true" : "false"}
        data-disabled={props.model.isDisabled() ? "true" : "false"}
        data-theme={props.base.dataTheme}
        style={props.base.style}
      >
        {props.children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTriggerLayout(
  props: LayoutProps<AccordionTriggerModel, HTMLButtonElement> & {
    type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"];
    indicator?: JSX.Element;
    showIndicator?: boolean;
  },
): JSX.Element {
  return (
    <button
      {...(props.others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      id={props.model.id()}
      type={props.type ?? "button"}
      class={accordionTrigger({
        class: props.base.class,
        className: props.base.className,
      })}
      data-slot="accordion-trigger"
      data-expanded={props.model.isExpanded() ? "true" : "false"}
      data-theme={props.base.dataTheme}
      style={props.base.style}
      aria-expanded={props.model.isExpanded() ? "true" : "false"}
      aria-controls={props.model.contentId()}
      aria-disabled={props.model.isDisabled() ? "true" : undefined}
      disabled={props.model.isDisabled()}
      onClick={props.model.onClick}
      onKeyDown={props.model.onKeyDown}
    >
      {props.children}
      <Show when={props.showIndicator !== false}>
        <AccordionIndicatorLayout expanded={props.model.isExpanded()}>
          {props.indicator}
        </AccordionIndicatorLayout>
      </Show>
    </button>
  );
}

export function AccordionIndicatorLayout(props: {
  expanded: boolean;
  base?: IComponentBaseProps;
  others?: JSX.HTMLAttributes<HTMLSpanElement>;
  children?: JSX.Element;
}): JSX.Element {
  return (
    <span
      {...props.others}
      aria-hidden="true"
      class={accordionIndicator({
        expanded: props.expanded,
        class: props.base?.class,
        className: props.base?.className,
      })}
      data-slot="accordion-indicator"
      data-expanded={props.expanded ? "true" : "false"}
      data-theme={props.base?.dataTheme}
      style={props.base?.style}
    >
      <Show
        when={props.children}
        fallback={<AccordionChevron />}
      >
        {props.children}
      </Show>
    </span>
  );
}

export function AccordionContentLayout(props: {
  expanded: boolean;
  keepMounted: boolean;
  triggerId?: string;
  contentId?: string;
  base: IComponentBaseProps;
  others: JSX.HTMLAttributes<HTMLDivElement>;
  children?: JSX.Element;
}): JSX.Element {
  return (
    // Previously an early `if (!keepMounted && !expanded) return null` in the
    // component body. That runs once, at creation, outside any tracking scope,
    // so a `keepMounted={false}` panel that started closed could never open.
    // Expressed as `Show`, the same intent is reactive.
    <Show when={props.keepMounted || props.expanded}>
      <div
        {...props.others}
        id={props.contentId}
        role="region"
        class={accordionContent({
          expanded: props.expanded,
          class: props.base.class,
          className: props.base.className,
        })}
        data-slot="accordion-content"
        data-expanded={props.expanded ? "true" : "false"}
        data-theme={props.base.dataTheme}
        style={props.base.style}
        aria-hidden={props.expanded ? "false" : "true"}
        aria-labelledby={props.triggerId}
      >
        <div
          class={accordionBody()}
          data-slot="accordion-body"
        >
          <div
            class={accordionBodyInner()}
            data-slot="accordion-body-inner"
          >
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
}

function AccordionChevron(): JSX.Element {
  return (
    <svg
      fill="none"
      role="presentation"
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
