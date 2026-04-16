// ---------------------------------------------------------------------------
// Legacy Felte-based API (deprecated — will be removed when all forms migrate)
// ---------------------------------------------------------------------------
export {
  useForm,
  getFormControllerFromElement,
  type FormController,
  type FormDirective,
  type FormPathQuery,
  type UseFormOptions,
} from "./useForm";
export {
  useFieldMeta,
  type FieldName,
  type UseFieldOptions,
  type UseFieldMetaResult,
} from "./useFieldMeta";
export { useFieldError } from "./useFieldError";
/** @deprecated Use `useField` from the new TanStack-based API instead. */
export { useField as useFieldLegacy, type UseFieldResult as UseFieldLegacyResult } from "./useField";
export { useFieldProps, type UseFieldPropsResult } from "./useFieldProps";

// ---------------------------------------------------------------------------
// New TanStack Form-based API
// ---------------------------------------------------------------------------
export { createForm, type CreateFormOptions, type FormApi } from "./createForm";
export { FormContext, useFormContext, type AnyFormApi } from "./FormContext";
export { useField, type UseFieldResult } from "./useFieldNew";
export { getFirstFieldError } from "./getFirstFieldError";
