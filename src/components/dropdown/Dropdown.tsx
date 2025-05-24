import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";
import DropdownMenu from "./DropdownMenu";
import DropdownItem from "./DropdownItem";
import DropdownToggle from "./DropdownToggle";

type ElementType = keyof JSX.IntrinsicElements;

export type DropdownProps<E extends ElementType = "div"> = Omit<
  JSX.IntrinsicElements[E],
  | "item"
  | "horizontal"
  | "vertical"
  | "end"
  | "hover"
  | "open"
  | "class"
  | "className"
> &
  IComponentBaseProps & {
    /** custom trigger content or menu items */
    item?: JSX.Element;
    horizontal?: "left" | "right";
    vertical?: "top" | "bottom";
    end?: boolean;
    hover?: boolean;
    open?: boolean;
    as?: E;
    class?: string;
    className?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
  };

// helper for computing classes
export function dropdownClassName({
  className,
  horizontal,
  vertical,
  end,
  hover,
  open,
}: Pick<
  DropdownProps,
  "className" | "horizontal" | "vertical" | "end" | "hover" | "open"
>) {
  return twMerge(
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
}

export const Dropdown = <E extends ElementType = "div">(
  props: DropdownProps<E>
): JSX.Element => {
  const [local, others] = splitProps(props as DropdownProps, [
    "children",
    "item",
    "horizontal",
    "vertical",
    "end",
    "hover",
    "open",
    "as",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const Tag = (local.as || "div") as ElementType;

  const classes = () =>
    dropdownClassName({
      className: local.class ?? local.className,
      horizontal: local.horizontal,
      vertical: local.vertical,
      end: local.end,
      hover: local.hover,
      open: local.open,
    });

  return (
    <Dynamic
      component={Tag}
      {...others}
      role="listbox"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.item ? (
        <>
          <label tabIndex={0}>{local.children}</label>
          <ul class="dropdown-content">{local.item}</ul>
        </>
      ) : (
        <>{local.children}</>
      )}
    </Dynamic>
  );
};

export default Object.assign(Dropdown, {
  Toggle: DropdownToggle,
  Menu: DropdownMenu,
  Item: DropdownItem,
});
