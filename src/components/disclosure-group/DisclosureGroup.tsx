import "./DisclosureGroup.css";
import { createContext, createMemo, createSignal, splitProps, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./DisclosureGroup.classes";

export type DisclosureGroupContextValue = {
  expandedKeys: () => Set<string>;
  setExpandedKeys: (keys: Set<string>) => void;
  allowsMultipleExpanded: () => boolean;
  isDisabled: () => boolean;
};

export const DisclosureGroupContext = createContext<DisclosureGroupContextValue>();

export type DisclosureGroupRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    expandedKeys?: Set<string | number>;
    defaultExpandedKeys?: Set<string | number>;
    onExpandedChange?: (keys: Set<string | number>) => void;
    allowsMultipleExpanded?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
  };

const normalizeKeys = (keys: Set<string | number> | undefined) => {
  if (!keys) return new Set<string>();
  return new Set(Array.from(keys).map((key) => String(key)));
};

const DisclosureGroupRoot: ParentComponent<DisclosureGroupRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "expandedKeys",
    "defaultExpandedKeys",
    "onExpandedChange",
    "allowsMultipleExpanded",
    "isDisabled",
    "disabled",
  ]);

  const allowsMultipleExpanded = () => Boolean(local.allowsMultipleExpanded);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);

  const [internalKeys, setInternalKeys] = createSignal<Set<string>>(
    normalizeKeys(local.defaultExpandedKeys),
  );

  const expandedKeys = createMemo(() =>
    local.expandedKeys !== undefined ? normalizeKeys(local.expandedKeys) : internalKeys(),
  );

  const setExpandedKeys = (keys: Set<string>) => {
    if (local.expandedKeys === undefined) {
      setInternalKeys(new Set(keys));
    }
    local.onExpandedChange?.(new Set(keys));
  };

  const ctx: DisclosureGroupContextValue = {
    expandedKeys,
    setExpandedKeys,
    allowsMultipleExpanded,
    isDisabled,
  };

  return (
    <DisclosureGroupContext.Provider value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
        data-slot="disclosure-group"
        data-multiple={allowsMultipleExpanded() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
        aria-disabled={isDisabled() ? "true" : undefined}
      >
        {local.children}
      </div>
    </DisclosureGroupContext.Provider>
  );
};

const DisclosureGroup = Object.assign(DisclosureGroupRoot, {
  Root: DisclosureGroupRoot,
});

export default DisclosureGroup;
export { DisclosureGroupRoot };
