import { createContext } from "solid-js";

import type { Size, Variant } from "../vocabulary";

export type ButtonGroupContextValue = {
  size: () => Size | undefined;
  variant: () => Variant | undefined;
  isDisabled: () => boolean | undefined;
  fullWidth: () => boolean | undefined;
};

export const ButtonGroupContext = createContext<ButtonGroupContextValue>();
