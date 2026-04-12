import "./Form.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type FormRootProps = JSX.FormHTMLAttributes<HTMLFormElement> & IComponentBaseProps;

const FormRoot: Component<FormRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <form
      {...others}
      class={twMerge("form", local.class, local.className)}
      data-slot="form"
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

const Form = Object.assign(FormRoot, {
  Root: FormRoot,
});

export default Form;
export { Form, FormRoot };
export type { FormRootProps as FormProps };
