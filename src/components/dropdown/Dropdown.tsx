// components/dropdown/Dropdown.tsx
import { clsx } from "clsx";
import { type JSX, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import DropdownDetails from "./DropdownDetails";
import DropdownItem from "./DropdownItem";
import DropdownMenu from "./DropdownMenu";
import DropdownToggle from "./DropdownToggle";

export type DropdownProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    item?: JSX.Element;
    horizontal?: "left" | "right";
    vertical?: "top" | "bottom";
    end?: boolean;
    hover?: boolean;
    open?: boolean;
    // ARIA attributes
    "aria-label"?: string;
    "aria-describedby"?: string;
    "aria-expanded"?: boolean;
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
    "aria-labelledby"?: string;
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
    "aria-label",
    "aria-describedby",
    "aria-expanded",
    "aria-haspopup",
    "aria-labelledby",
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
      role={local.item ? "combobox" : "listbox"}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-expanded={local["aria-expanded"] ?? local.open}
      aria-haspopup={
        local["aria-haspopup"] === true ? "true" :
          local["aria-haspopup"] === false ? "false" :
            local["aria-haspopup"] || (local.item ? "listbox" : "true")
      }
      aria-labelledby={local["aria-labelledby"]}
    >
      <Show when={local.item} fallback={<>{local.children}</>}>
        <label tabIndex={0}>{local.children}</label>
        <ul class="dropdown-content" role="listbox">{local.item}</ul>
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
