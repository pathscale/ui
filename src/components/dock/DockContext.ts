import { createContext } from "solid-js";
import type { Accessor } from "solid-js";

export const DockContext = createContext<{
  color: string;
  selected?: Accessor<string | undefined>;
  setSelected?: (val: string) => void;
}>();
