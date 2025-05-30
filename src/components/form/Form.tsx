import { type JSX, type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";
import Label from "./Label";

export type FormProps = Omit<JSX.HTMLAttributes<HTMLFormElement>, "ref"> &
  IComponentBaseProps;

const Form: ParentComponent<FormProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "dataTheme",
    "class",
    "className",
  ]);

  const classes = () => twMerge("form-control", local.class, local.className);

  return (
    <form
      role="form"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {local.children}
    </form>
  );
};

export default Object.assign(Form, { Label });
