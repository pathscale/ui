import type { Accessor } from "solid-js";
import { createContext } from "solid-js";

export const DropdownContext = createContext<{
  open: Accessor<boolean>;
  setOpen: (v: boolean) => void;
  disabled?: boolean;
  hoverable?: boolean;
  position?: "left" | "right" | "top-left" | "top-right";
}>();
