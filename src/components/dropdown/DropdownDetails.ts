import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { classesFn } from "./Dropdown";
import type { DropdownProps } from "./Dropdown";
import { Summary } from "./DropdownToggle";

type ElementType = keyof JSX.IntrinsicElements;

export type DetailsProps<E extends ElementType = "details"> = Omit<
  DropdownProps<E>,
  "item" | "hover"
>;

const Details = <E extends ElementType = "details">(
  props: DetailsProps<E>
): JSX.Element => {
  const [local, others] = splitProps(props as DetailsProps, [
    "children",
    "class",
    "className",
    "horizontal",
    "vertical",
    "end",
    "open",
    "dataTheme",
  ]);

  const classes = () =>
    classesFn({
      className: local.class ?? local.className,
      horizontal: local.horizontal,
      vertical: local.vertical,
      end: local.end,
      open: local.open,
    });

  return (
    <Dynamic
      component={("details" as E)}
      {...others}
      role="listbox"
      data-theme={local.dataTheme}
      class={classes()}
      open={local.open}
    >
      {local.children}
    </Dynamic>
  );
};

export default Object.assign(Details, {
  Toggle: Summary,
});
