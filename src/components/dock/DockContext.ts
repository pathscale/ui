import { createContext } from "solid-js";
import type { Accessor } from "solid-js";
import { ComponentColor } from "../types";

export const DockContext = createContext<{
  color: ComponentColor; 
  selected?: Accessor<string | undefined>;
  setSelected?: (val: string) => void;
}>();
