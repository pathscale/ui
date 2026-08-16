import { createContext, useContext } from "solid-js";
import type { FormApi } from "./createForm";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

// The context holds a form whose value type the provider knows and the
// consumer does not, so the stored type erases it.
export type AnyFormApi = FormApi<any>;

export const FormContext = createContext<AnyFormApi | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Reads the nearest `FormApi` from the component tree.
 *
 * Must be called inside a `<Form form={...}>` component. Throws a clear error
 * in development if called outside a form context so the mistake is obvious
 * rather than silently returning `undefined`.
 *
 * @example
 * // Inside a component rendered as a child of <Form form={form}>
 * const form = useFormContext();
 * const value = form.getFieldValue("email");
 */
export const useFormContext = (): AnyFormApi => {
  const ctx = useContext(FormContext);

  if (ctx === null) {
    throw new Error(
      "[pathscale/ui] useFormContext() was called outside of a <Form> component.\n" +
      "Make sure this component is rendered as a descendant of <Form form={...}>.",
    );
  }

  return ctx;
};
