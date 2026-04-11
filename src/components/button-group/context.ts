import { createContext } from "solid-js";

import type { ButtonSize, ButtonVariant } from "../button";

export type ButtonGroupContextValue = {
  size: () => ButtonSize | undefined;
  variant: () => ButtonVariant | undefined;
  isDisabled: () => boolean | undefined;
  fullWidth: () => boolean | undefined;
};

export const ButtonGroupContext = createContext<ButtonGroupContextValue>();
