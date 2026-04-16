import { splitProps, type ParentComponent } from "solid-js";
import Button from "../button";
import type { ButtonProps } from "../button";
import { useFormContext } from "../../hooks/form/FormContext";
import type { AnyFormApi } from "../../hooks/form/FormContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FormSubmitButtonProps = Omit<ButtonProps, "type" | "isDisabled" | "isPending"> & {
  /**
   * Escape hatch: explicit form override for Portal / out-of-tree usage.
   * When provided, the component does NOT read from context.
   */
  form?: AnyFormApi;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Submit button that subscribes to form state and disables/shows pending
 * automatically.
 *
 * Must be rendered inside a `<Form form={...}>` component (or receive an
 * explicit `form` prop).
 *
 * ```tsx
 * <Form form={form}>
 *   ...
 *   <FormSubmitButton>Log in</FormSubmitButton>
 * </Form>
 * ```
 */
const FormSubmitButton: ParentComponent<FormSubmitButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["form", "children"]);

  const resolveForm = (): AnyFormApi => {
    if (local.form != null) return local.form;
    return useFormContext();
  };

  const form = resolveForm();
  const tsForm = form._tsForm;

  return (
    <tsForm.Subscribe
      selector={(s: { canSubmit: boolean; isSubmitting: boolean }) => ({
        canSubmit: s.canSubmit,
        isSubmitting: s.isSubmitting,
      })}
      children={(state: () => { canSubmit: boolean; isSubmitting: boolean }) => (
        <Button
          {...others}
          type="submit"
          isDisabled={!state().canSubmit}
          isPending={state().isSubmitting}
        >
          {local.children}
        </Button>
      )}
    />
  );
};

export default FormSubmitButton;
export { FormSubmitButton };
