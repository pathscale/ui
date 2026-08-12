import "./Accordion.css";
import {
  type Component,
  type JSX,
  type ParentComponent,
  splitProps,
} from "solid-js";

import { splitBase } from "../../lib/props";
import type { IComponentBaseProps } from "../types";
import {
  AccordionContentLayout,
  AccordionIndicatorLayout,
  AccordionItemLayout,
  AccordionRootLayout,
  AccordionTriggerLayout,
} from "./Accordion.layout";
import {
  type AccordionSelectionMode,
  type AccordionValue,
  type AccordionVariant,
  createAccordionItem,
  createAccordionRoot,
  createAccordionTrigger,
  useAccordionItemContext,
} from "./useAccordion";

/**
 * The wiring layer: split the props, build the model, hand it to the layout.
 *
 * Each of these bodies should stay boring. The hook is called here, in the
 * component body, and its result is passed down as a value. Calling it in the
 * JSX position instead (`<Layout model={createAccordionRoot(props)} />`) type-
 * checks and appears to work, but props are getters: the call then happens
 * under the layout's reactive scope rather than this component's, and anything
 * the model reads later from an event handler has lost its owner. Keep the
 * `const model = ...` line.
 */

export type AccordionRootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    selectionMode?: AccordionSelectionMode;
    value?: AccordionValue;
    defaultValue?: AccordionValue;
    onValueChange?: (value: string[]) => void;
    hideSeparator?: boolean;
    variant?: AccordionVariant;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type AccordionItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    value?: string;
    children?: JSX.Element;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type AccordionTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    showIndicator?: boolean;
    indicator?: JSX.Element;
  };

export type AccordionContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    keepMounted?: boolean;
  };

export type AccordionIndicatorProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const AccordionRoot: ParentComponent<AccordionRootProps> = (props) => {
  const [base, own, others] = splitBase(props, [
    "children",
    "selectionMode",
    "value",
    "defaultValue",
    "onValueChange",
    "hideSeparator",
    "variant",
    "isDisabled",
    "disabled",
    "ref",
  ] as const);

  const model = createAccordionRoot(own, (node) => {
    if (typeof own.ref === "function") {
      (own.ref as (node: HTMLDivElement) => void)(node);
    }
  });

  return AccordionRootLayout({
    model,
    base,
    others,
    get children() {
      return own.children;
    },
  });
};

const AccordionItem: ParentComponent<AccordionItemProps> = (props) => {
  const [base, own, others] = splitBase(props, [
    "value",
    "children",
    "isDisabled",
    "disabled",
  ] as const);

  const model = createAccordionItem(own);

  return AccordionItemLayout({
    model,
    base,
    others,
    get children() {
      return own.children;
    },
  });
};

const AccordionTrigger: Component<AccordionTriggerProps> = (props) => {
  const [base, own, others] = splitBase(props, [
    "children",
    "onClick",
    "onKeyDown",
    "type",
    "showIndicator",
    "indicator",
  ] as const);

  const model = createAccordionTrigger(own);

  return AccordionTriggerLayout({
    model,
    base,
    others,
    get type() {
      return own.type;
    },
    get showIndicator() {
      return own.showIndicator;
    },
    get indicator() {
      return own.indicator;
    },
    get children() {
      return own.children;
    },
  });
};

const AccordionContent: ParentComponent<AccordionContentProps> = (props) => {
  const item = useAccordionItemContext();
  const [base, own, others] = splitBase(props, [
    "children",
    "keepMounted",
  ] as const);

  return AccordionContentLayout({
    base,
    others,
    get expanded() {
      return Boolean(item?.isExpanded());
    },
    get keepMounted() {
      return own.keepMounted ?? true;
    },
    get triggerId() {
      return item?.triggerId();
    },
    get contentId() {
      return item?.contentId();
    },
    get children() {
      return own.children;
    },
  });
};

const AccordionIndicator: Component<AccordionIndicatorProps> = (props) => {
  const item = useAccordionItemContext();
  const [base, own, others] = splitProps(
    props,
    ["class", "className", "dataTheme", "style"],
    ["children"],
  );

  return AccordionIndicatorLayout({
    base,
    others,
    get expanded() {
      return Boolean(item?.isExpanded());
    },
    get children() {
      return own.children;
    },
  });
};

const Accordion = Object.assign(AccordionRoot, {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
  Indicator: AccordionIndicator,
});

export default Accordion;
export type {
  AccordionSelectionMode,
  AccordionValue,
  AccordionVariant,
} from "./useAccordion";
export type { AccordionRootProps as AccordionProps };
export {
  Accordion,
  AccordionContent,
  AccordionIndicator,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
};
