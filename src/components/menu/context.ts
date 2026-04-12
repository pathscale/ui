import { createContext, type Accessor } from "solid-js";

export type MenuItemVariant = "default" | "danger";
export type MenuSelectionMode = "none" | "single" | "multiple";

export type MenuItemRecord = {
  key: string;
  disabled: boolean;
  ref: HTMLDivElement;
};

export type MenuFocusTarget = "first" | "last" | "selected";

export type MenuContextValue = {
  selectionMode: Accessor<MenuSelectionMode>;
  selectedKeys: Accessor<Set<string>>;
  disabledKeys: Accessor<Set<string>>;
  isDisabled: Accessor<boolean>;
  focusedKey: Accessor<string | undefined>;
  isSelected: (key: string) => boolean;
  isItemDisabled: (key: string, localDisabled?: boolean) => boolean;
  getItemTabIndex: (key: string, localDisabled?: boolean) => number;
  registerItem: (item: MenuItemRecord) => void;
  unregisterItem: (key: string) => void;
  activateKey: (key: string, event: Event) => void;
  setFocusedKey: (key: string | undefined) => void;
  focusNext: (direction: 1 | -1) => void;
  focusBoundary: (target: MenuFocusTarget) => void;
};

export const MenuContext = createContext<MenuContextValue>();
