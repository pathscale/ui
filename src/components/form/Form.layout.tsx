import "./Form.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Form.recipe";
import { FormContext, type AnyFormApi } from "../../hooks/form/FormContext";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Form.recipe";

export type FormRootProps = JSX.FormHTMLAttributes<HTMLFormElement> & IComponentBaseProps;

const FormRoot: Layout<typeof componentRecipe, FormRootProps> = () => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <form
      {...others}
      {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
      data-slot="form"
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

export type FormWithContextProps = Omit<JSX.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> &
  IComponentBaseProps & {
    /**
     * The form API returned by `createForm()`.
     * Providing this prop switches the component into context-providing mode:
     * it registers the form instance for all `<FormField>`, `<FormSubmitButton>`,
     * and `useField()` calls in the subtree.
     */
    form: AnyFormApi;
    /**
     * Optional additional onSubmit handler called *after* `form.handleSubmit()`.
     * Rarely needed — prefer setting `onSubmit` on `createForm(options)` instead.
     */
    onSubmit?: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent>;
  };

const FormWithContext: Layout<typeof componentRecipe, FormWithContextProps> = () => {
  const [local, others] = splitProps(props, [
    "form",
    "class",
    "className",
    "dataTheme",
    "style",
    "onSubmit",
    "children",
  ]);

  const handleSubmit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    local.form._tsForm.handleSubmit();
    if (typeof local.onSubmit === "function") {
      local.onSubmit(e);
    }
  };

  return (
    <FormContext.Provider value={local.form}>
      <form
        {...others}
        onSubmit={handleSubmit}
        {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
        data-slot="form"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </form>
    </FormContext.Provider>
  );
};

/**
 * Styled form element.
 *
 * **Without `form` prop** — renders a plain `<form>` with DaisyUI base styles.
 *
 * **With `form` prop** — provides the form instance via context so that child
 * `<FormField>`, `<FormSubmitButton>`, and `useField()` calls resolve
 * automatically without prop drilling. Also wires `onSubmit` to
 * `form.handleSubmit()` automatically.
 *
 * ```tsx
 * const form = createForm({ defaultValues, schema, onSubmit });
 * <Form form={form} class="space-y-4">{...}</Form>
 * ```
 */
const Form: Layout<typeof componentRecipe, FormRootProps | FormWithContextProps> = () => {
  if ("form" in props && props.form != null) {
    return <FormWithContext {...(props as FormWithContextProps)} />;
  }
  return <FormRoot {...(props as FormRootProps)} />;
};

(Form as unknown as Record<string, unknown>).Root = FormRoot;
(Form as unknown as Record<string, unknown>).WithContext = FormWithContext;

export default Form;
export { Form, FormRoot, FormWithContext };
export type { FormRootProps as FormProps };
