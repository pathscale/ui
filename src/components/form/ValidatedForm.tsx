import {
  children as resolveChildren,
  createMemo,
  splitProps,
  type JSX,
} from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { z } from "zod";
import Form, { type FormProps } from "./Form";
import FormValidationContext, {
  type FormValidationContext as FormValidationContextType,
} from "./FormValidationContext";

export type ValidatedFormProps<T extends z.ZodTypeAny> = Omit<
  FormProps,
  "onSubmit"
> & {
  schema: T;
  onSubmit: (values: z.infer<T>) => void | Promise<void>;
  initialValues?: Partial<z.infer<T>>;
};


function ValidatedForm<T extends z.ZodTypeAny>(
  props: ValidatedFormProps<T>
): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "schema",
    "onSubmit",
    "initialValues",
  ]);

  const felteForm = createForm<z.infer<T>>({
    initialValues: local.initialValues,
    extend: [validator({ schema: local.schema })],
    onSubmit: local.onSubmit,
  });

  const {
    form,
    data,
    errors,
    warnings,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    isValidating,
    interacted,
    reset,
    validate,
    setData,
    setFields,
    setTouched,
    setErrors,
    setWarnings,
    setIsDirty,
    setIsSubmitting,
    setInteracted,
    createSubmitHandler,
    setInitialValues,
    addField,
    unsetField,
    resetField,
    swapFields,
    moveField,
  } = felteForm;

  const resolvedChildren = resolveChildren(() => local.children);

  const contextValue = createMemo(
    (): FormValidationContextType<z.infer<T>> => ({
      // Form state stores
      data,
      errors,
      warnings,
      touched,
      isValid,
      isSubmitting,
      isDirty,
      isValidating,
      interacted,

      // Form control functions
      reset,
      validate,

      // Setter functions
      setData,
      setFields,
      setTouched,
      setErrors,
      setWarnings,
      setIsDirty,
      setIsSubmitting,
      setInteracted,

      // Form manipulation functions
      createSubmitHandler: createSubmitHandler as any,
      setInitialValues,

      // Dynamic field management
      addField: addField as any,
      unsetField: unsetField as any,
      resetField: resetField as any,
      swapFields: swapFields as any,
      moveField: moveField as any,
    })
  );

  return (
    <FormValidationContext.Provider value={contextValue()}>
      <Form {...others} ref={form}>
        {resolvedChildren()}
      </Form>
    </FormValidationContext.Provider>
  );
}

export default ValidatedForm;
