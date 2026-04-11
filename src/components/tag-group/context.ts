import { createContext, type Accessor } from "solid-js";

import type { TagSize, TagVariant } from "../tag";

export type TagSelectionMode = "none" | "single" | "multiple";

export type TagGroupContextValue = {
  size: Accessor<TagSize>;
  variant: Accessor<TagVariant>;
  selectionMode: Accessor<TagSelectionMode>;
  selectedKeys: Accessor<Set<string>>;
  disabledKeys: Accessor<Set<string>>;
  isDisabled: Accessor<boolean>;
  allowsRemoving: Accessor<boolean>;
  selectKey: (key: string, event: Event) => void;
  removeKey: (key: string, event: Event) => void;
};

export const TagGroupContext = createContext<TagGroupContextValue>();
