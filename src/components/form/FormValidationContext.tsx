import { createContext, useContext } from "solid-js";

export interface FormValidationContext<T = any> {
  // Form state stores (accessor functions)
  data: (path?: string | ((data: T) => any)) => any;
  errors: (path?: string | ((errors: any) => any)) => any;
  warnings: (path?: string | ((warnings: any) => any)) => any;
  touched: (path?: string | ((touched: any) => any)) => any;
  isValid: () => boolean;
  isSubmitting: () => boolean;
  isDirty: () => boolean;
  isValidating: () => boolean;
  interacted: () => string | null;

  // Form control functions
  reset: () => void;
  validate: () => Promise<any>;

  // Setter functions
  setData: (...args: any[]) => void;
  setFields: (...args: any[]) => void;
  setTouched: (...args: any[]) => void;
  setErrors: (...args: any[]) => void;
  setWarnings: (...args: any[]) => void;
  setIsDirty: (...args: any[]) => void;
  setIsSubmitting: (...args: any[]) => void;
  setInteracted: (...args: any[]) => void;

  // Form manipulation functions
  createSubmitHandler: (config?: {
    onSubmit?: (values: T) => void | Promise<void>;
    validate?: (values: T) => any;
    onError?: (errors: any) => void;
  }) => (event?: Event) => void;
  setInitialValues: (values: Partial<T>) => void;

  // Dynamic field management
  addField: (path: string, value?: any, index?: number) => void;
  unsetField: (path: string) => void;
  resetField: (path: string) => void;
  swapFields: (path: string, from: number, to: number) => void;
  moveField: (path: string, from: number, to: number) => void;
}

const FormValidationContext = createContext<FormValidationContext>();

export function useFormValidation<T = any>(): FormValidationContext<T> {
  const context = useContext(FormValidationContext);
  if (!context) {
    throw new Error(
      "useFormValidation must be used within a Form.Validated component. " +
        "Make sure your component is wrapped in <Form.Validated>...</Form.Validated>"
    );
  }
  return context as FormValidationContext<T>;
}

export default FormValidationContext;
