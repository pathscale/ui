import { createContext, useContext } from "solid-js";
import type { FormApi } from "./createForm";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

// We use `any` here because the form's generic parameters are deeply nested
// TanStack types — the context just needs to hold the opaque FormApi wrapper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * const tsForm = form._tsForm;
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
