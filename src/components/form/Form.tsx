import {
  children as resolveChildren,
  createMemo,
  type JSX,
  type ParentComponent,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";
import FormLabel from "./Label";
import ValidatedForm, { useFormValidation } from "./ValidatedForm";
export { type ValidatedFormProps } from "./ValidatedForm";

export type FormProps = Omit<JSX.HTMLAttributes<HTMLFormElement>, "ref"> &
  IComponentBaseProps;

const Form: ParentComponent<FormProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "dataTheme",
    "class",
    "className",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = () => twMerge("form-control", local.class, local.className);

  return (
    <form
      role="form"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {resolvedChildren()}
    </form>
  );
};

export { useFormValidation };
export default Object.assign(Form, {
  Label: FormLabel,
  Validated: ValidatedForm,
});
