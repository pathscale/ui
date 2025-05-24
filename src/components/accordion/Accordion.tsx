import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";
import { CollapseTitle, CollapseContent } from "../collapse";

type AccordionBaseProps = {
  name?: string;
  icon?: "arrow" | "plus";
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type AccordionProps = AccordionBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof AccordionBaseProps>;

const Accordion = (props: AccordionProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "name",
    "icon",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "collapse",
      clsx({
        "collapse-arrow": local.icon === "arrow",
        "collapse-plus": local.icon === "plus",
      }),
      local.class,
      local.className
    );

  return (
    <div class={classes()} data-theme={local.dataTheme} style={local.style}>
      <input type="radio" name={local.name ?? "accordion"} {...others} />
      {props.children}
    </div>
  );
};

Accordion.Title = CollapseTitle;
Accordion.Content = CollapseContent;

export default Accordion;
