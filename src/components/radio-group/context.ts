import { createContext, type Accessor } from "solid-js";

export type RadioGroupContextValue = {
  name: Accessor<string>;
  value: Accessor<string | undefined>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  selectValue: (value: string, event: Event) => void;
};

/*
 * Defaulted to `null`: this context is optional by construction.
 *
 * Consumers either optional-chain it or guard on it, so the component works
 * standalone without its root, which is a supported shape. Solid 2 made that
 * throw: `getContext` raises `ContextNotFoundError` when the resolved value is
 * `undefined`, and it throws before the optional chain can run. `null` is a
 * value, so the lookup succeeds and the existing reads behave as they always
 * have.
 *
 * A truthy default such as `{}` would silence the throw and be worse: the
 * optional chain would then call methods that do not exist.
 */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
