import { createContext, type Accessor } from "solid-js";

export type ListBoxVariant = "default" | "danger";
export type ListBoxSelectionMode = "none" | "single" | "multiple";

export type ListBoxItemRecord = {
  key: string;
  disabled: boolean;
  ref: HTMLDivElement;
};

export type ListBoxFocusTarget = "first" | "last" | "selected";

export type ListBoxContextValue = {
  variant: Accessor<ListBoxVariant>;
  selectionMode: Accessor<ListBoxSelectionMode>;
  selectedKeys: Accessor<Set<string>>;
  disabledKeys: Accessor<Set<string>>;
  isDisabled: Accessor<boolean>;
  focusedKey: Accessor<string | undefined>;
  isSelected: (key: string) => boolean;
  isItemDisabled: (key: string, localDisabled?: boolean) => boolean;
  getItemTabIndex: (key: string, localDisabled?: boolean) => number;
  registerItem: (item: ListBoxItemRecord) => void;
  unregisterItem: (key: string) => void;
  activateKey: (key: string, event: Event) => void;
  setFocusedKey: (key: string | undefined) => void;
  focusNext: (direction: 1 | -1) => void;
  focusBoundary: (target: ListBoxFocusTarget) => void;
};

export const ListBoxContext = createContext<ListBoxContextValue>();
