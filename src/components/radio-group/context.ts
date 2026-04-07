import { createContext, type Accessor } from "solid-js";

export type RadioGroupContextValue = {
  name: Accessor<string>;
  value: Accessor<string | undefined>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  selectValue: (value: string, event: Event) => void;
};

export const RadioGroupContext = createContext<RadioGroupContextValue>();
