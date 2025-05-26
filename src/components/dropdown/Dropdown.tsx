// components/dropdown/Dropdown.tsx
import { type JSX, splitProps, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";
import DropdownDetails from "./DropdownDetails";
import DropdownMenu from "./DropdownMenu";
import DropdownItem from "./DropdownItem";
import DropdownToggle from "./DropdownToggle";

export type DropdownProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    item?: JSX.Element;
    horizontal?: "left" | "right";
    vertical?: "top" | "bottom";
    end?: boolean;
    hover?: boolean;
    open?: boolean;
  };

export const classesFn = ({
  className,
  horizontal,
  vertical,
  end,
  hover,
  open,
}: Pick<
  DropdownProps,
  "className" | "horizontal" | "vertical" | "end" | "hover" | "open"
>) =>
  twMerge(
    "dropdown",
    className,
    clsx({
      "dropdown-left": horizontal === "left",
      "dropdown-right": horizontal === "right",
      "dropdown-top": vertical === "top",
      "dropdown-bottom": vertical === "bottom",
      "dropdown-end": end,
      "dropdown-hover": hover,
      "dropdown-open": open,
    })
  );

const Dropdown = (props: DropdownProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "className",
    "item",
    "horizontal",
    "vertical",
    "end",
    "hover",
    "open",
    "dataTheme",
  ]);

  const classes = () =>
    classesFn({
      className: local.className,
      horizontal: local.horizontal,
      vertical: local.vertical,
      end: local.end,
      hover: local.hover,
      open: local.open,
    });

  return (
    <div
      role="listbox"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      <Show when={local.item} fallback={<>{local.children}</>}>
        <label tabIndex={0}>{local.children}</label>
        <ul class="dropdown-content">{local.item}</ul>
      </Show>
    </div>
  );
};

export default Object.assign(Dropdown, {
  Details: DropdownDetails,
  Toggle: DropdownToggle,
  Menu: DropdownMenu,
  Item: DropdownItem,
});
