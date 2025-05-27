// components/dropdown/Details.tsx
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { DropdownProps } from "./Dropdown";
import { classesFn } from "./Dropdown";
import { Summary } from "./DropdownToggle";

// Remove 'item' and 'hover' from the prop type
export type DetailsProps = Omit<
  DropdownProps<HTMLDetailsElement>,
  "item" | "hover"
>;

const Details = (props: DetailsProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "className",
    "horizontal",
    "vertical",
    "end",
    "dataTheme",
    "open",
  ]);

  const classes = () =>
    classesFn({
      className: local.className,
      horizontal: local.horizontal,
      vertical: local.vertical,
      end: local.end,
      open: local.open,
    });

  return (
    <details
      role="listbox"
      {...others}
      data-theme={local.dataTheme}
      class={twMerge(classes())}
      open={local.open}
    >
      {local.children}
    </details>
  );
};

export default Object.assign(Details, {
  Toggle: Summary,
});
