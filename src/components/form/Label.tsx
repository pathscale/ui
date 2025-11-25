import {
  children as resolveChildren,
  type JSX,
  type ParentComponent,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type LabelProps = Omit<JSX.HTMLAttributes<HTMLLabelElement>, "ref"> &
  IComponentBaseProps & {
    title?: string;
  };

const Label: ParentComponent<LabelProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "title",
    "dataTheme",
    "class",
    "className",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = () => twMerge("label", local.class, local.className);

  return (
    <label
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      <span class="label-text cursor-pointer">{local.title}</span>
      {resolvedChildren()}
    </label>
  );
};

export default Label;
