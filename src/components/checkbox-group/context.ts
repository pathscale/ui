import { createContext, type Accessor } from "solid-js";

import type { CheckboxVariant } from "../checkbox";

export type CheckboxGroupContextValue = {
  value: Accessor<string[]>;
  name: Accessor<string | undefined>;
  variant: Accessor<CheckboxVariant>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  toggleValue: (optionValue: string, checked: boolean, event: Event) => void;
};

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue>();
