import { createContext, createUniqueId, type JSX, useContext } from "solid-js";
import { invokeEventHandler } from "../../lib/events";
import { createControllableSignal } from "../../lib/state";

export type AccordionSelectionMode = "single" | "multiple";
export type AccordionVariant = "default" | "surface";
export type AccordionValue = string | string[];

/**
 * Every value that crosses this boundary goes through here, so a controlled
 * `value` and the internal signal can never disagree about shape: single mode
 * holds at most one entry whichever side set it.
 */
export const normalizeAccordionValue = (
  value: AccordionValue | undefined,
  selectionMode: AccordionSelectionMode,
): string[] => {
  if (value === undefined) return [];

  const raw = Array.isArray(value) ? value : [value];
  const normalized = Array.from(new Set(raw.map((entry) => String(entry))));
  return selectionMode === "single" ? normalized.slice(0, 1) : normalized;
};

export type AccordionContextValue = {
  selectionMode: () => AccordionSelectionMode;
  variant: () => AccordionVariant;
  hideSeparator: () => boolean;
  isDisabled: () => boolean;
  isItemExpanded: (value: string) => boolean;
  toggleItem: (value: string) => void;
  handleTriggerKeyDown: (
    event: KeyboardEvent,
    currentTarget: HTMLButtonElement,
  ) => void;
};

export type AccordionItemContextValue = {
  value: () => string;
  triggerId: () => string;
  contentId: () => string;
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  toggle: () => void;
};

export const AccordionContext = createContext<AccordionContextValue>();
export const AccordionItemContext = createContext<AccordionItemContextValue>();

/**
 * Sub-parts degrade rather than throw when used outside a root, matching how
 * Dropdown and Select behave. Modal and Toast throw instead; the difference is
 * deliberate and predates this refactor.
 */
export const useAccordionContext = () => useContext(AccordionContext);
export const useAccordionItemContext = () => useContext(AccordionItemContext);

export type AccordionRootOptions = {
  selectionMode?: AccordionSelectionMode;
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: string[]) => void;
  hideSeparator?: boolean;
  variant?: AccordionVariant;
  isDisabled?: boolean;
  disabled?: boolean;
};

export type AccordionRootModel = {
  variant: () => AccordionVariant;
  selectionMode: () => AccordionSelectionMode;
  hideSeparator: () => boolean;
  isDisabled: () => boolean;
  context: AccordionContextValue;
  setRootRef: (node: HTMLDivElement) => void;
};

/**
 * The root's whole behaviour: selection state, disabled resolution, and the
 * arrow-key roving between triggers.
 *
 * Must be called from a component body. It reads `options` getters lazily, so
 * the caller passes the live props object rather than a snapshot.
 */
export function createAccordionRoot(
  options: AccordionRootOptions,
  onRef?: (node: HTMLDivElement) => void,
): AccordionRootModel {
  const selectionMode = () => options.selectionMode ?? "single";
  const variant = () => options.variant ?? "default";
  const hideSeparator = () => Boolean(options.hideSeparator);
  const isDisabled = () =>
    Boolean(options.isDisabled) || Boolean(options.disabled);

  const [selectedValues, setSelectedValues] = createControllableSignal<
    string[]
  >({
    value: () =>
      options.value === undefined
        ? undefined
        : normalizeAccordionValue(options.value, selectionMode()),
    defaultValue: () =>
      normalizeAccordionValue(options.defaultValue, selectionMode()),
    onChange: (next) => options.onValueChange?.(next),
    normalize: (next) => normalizeAccordionValue(next, selectionMode()),
  });

  const isItemExpanded = (value: string) =>
    (selectedValues() ?? []).includes(value);

  const toggleItem = (value: string) => {
    if (isDisabled()) return;

    const currentValues = selectedValues() ?? [];
    const isExpanded = currentValues.includes(value);

    if (selectionMode() === "single") {
      setSelectedValues(isExpanded ? [] : [value]);
      return;
    }

    const next = new Set(currentValues);
    if (isExpanded) {
      next.delete(value);
    } else {
      next.add(value);
    }

    setSelectedValues(Array.from(next));
  };

  let rootRef: HTMLDivElement | undefined;

  const setRootRef = (node: HTMLDivElement) => {
    rootRef = node;
    onRef?.(node);
  };

  const handleTriggerKeyDown = (
    event: KeyboardEvent,
    currentTarget: HTMLButtonElement,
  ) => {
    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    if (!rootRef) return;

    // Queried live rather than tracked in a registry: the triggers are always
    // in the DOM (unlike menu items, which mount and unmount), so document
    // order is already the answer and cannot go stale.
    const triggers = Array.from(
      rootRef.querySelectorAll<HTMLButtonElement>(
        '[data-slot="accordion-trigger"]',
      ),
    ).filter(
      (trigger) =>
        !trigger.disabled && trigger.getAttribute("aria-disabled") !== "true",
    );

    if (!triggers.length) return;

    const currentIndex = triggers.indexOf(currentTarget);
    if (currentIndex < 0) return;

    event.preventDefault();

    if (event.key === "Home") {
      triggers[0]?.focus();
      return;
    }

    if (event.key === "End") {
      triggers[triggers.length - 1]?.focus();
      return;
    }

    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + triggers.length) % triggers.length;
    triggers[nextIndex]?.focus();
  };

  return {
    variant,
    selectionMode,
    hideSeparator,
    isDisabled,
    setRootRef,
    context: {
      selectionMode,
      variant,
      hideSeparator,
      isDisabled,
      isItemExpanded,
      toggleItem,
      handleTriggerKeyDown,
    },
  };
}

export type AccordionItemOptions = {
  value?: string;
  isDisabled?: boolean;
  disabled?: boolean;
};

export type AccordionItemModel = {
  context: AccordionItemContextValue;
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  hideSeparator: () => boolean;
};

export function createAccordionItem(
  options: AccordionItemOptions,
): AccordionItemModel {
  const accordion = useAccordionContext();

  // Stable per instance, and the fallback identity when the consumer gives no
  // `value`: an uncontrolled accordion still needs items to be distinguishable.
  const uniqueId = createUniqueId();
  const itemValue = () => options.value ?? uniqueId;

  const isExpanded = () => accordion?.isItemExpanded(itemValue()) ?? false;
  const isDisabled = () =>
    Boolean(options.isDisabled) ||
    Boolean(options.disabled) ||
    Boolean(accordion?.isDisabled());

  const toggle = () => {
    if (isDisabled()) return;
    accordion?.toggleItem(itemValue());
  };

  return {
    isExpanded,
    isDisabled,
    hideSeparator: () => Boolean(accordion?.hideSeparator()),
    context: {
      value: itemValue,
      triggerId: () => `accordion-trigger-${uniqueId}`,
      contentId: () => `accordion-content-${uniqueId}`,
      isExpanded,
      isDisabled,
      toggle,
    },
  };
}

export type AccordionTriggerOptions = {
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onKeyDown?: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent>;
};

export type AccordionTriggerModel = {
  id: () => string | undefined;
  contentId: () => string | undefined;
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  onClick: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
  onKeyDown: (
    event: KeyboardEvent & { currentTarget: HTMLButtonElement },
  ) => void;
};

export function createAccordionTrigger(
  options: AccordionTriggerOptions,
): AccordionTriggerModel {
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();

  const isDisabled = () => Boolean(item?.isDisabled());

  return {
    id: () => item?.triggerId(),
    contentId: () => item?.contentId(),
    isExpanded: () => Boolean(item?.isExpanded()),
    isDisabled,
    onClick: (event) => {
      // The consumer's handler runs first and can cancel ours, which is what
      // makes `preventDefault` in a wrapper actually suppress the toggle.
      invokeEventHandler(options.onClick, event);
      if (event.defaultPrevented || isDisabled()) return;
      item?.toggle();
    },
    onKeyDown: (event) => {
      invokeEventHandler(options.onKeyDown, event);
      if (event.defaultPrevented || isDisabled()) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item?.toggle();
        return;
      }

      accordion?.handleTriggerKeyDown(event, event.currentTarget);
    },
  };
}
