import { clsx } from "clsx";
import {
  type JSX,
  Show,
  splitProps,
  createMemo,
  createContext,
  createEffect,
  onMount,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import DropdownDetails from "./DropdownDetails";
import DropdownItem from "./DropdownItem";
import DropdownMenu from "./DropdownMenu";
import DropdownToggle from "./DropdownToggle";
import { useDropdown, type DropdownContextType } from "./dropdownContext";

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
    "aria-haspopup"?:
      | boolean
      | "false"
      | "true"
      | "menu"
      | "listbox"
      | "tree"
      | "grid"
      | "dialog";
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

// Create a dropdown context for this component
export const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined
);

const Dropdown = (props: DropdownProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "item",
    "horizontal",
    "vertical",
    "end",
    "hover",
    "open",
    "dataTheme",
    "style",
    "aria-label",
    "aria-describedby",
    "aria-expanded",
    "aria-haspopup",
    "aria-labelledby",
  ]);

  // Create dropdown context with appropriate trigger based on hover prop
  const dropdownCtx = useDropdown(local.hover ? "hover" : "click");

  let dropdownRef: HTMLDivElement | undefined;

  // Debug effect to track open state changes
  createEffect(() => {
    console.log("Dropdown open state:", dropdownCtx.open());

    // Directly manipulate the dropdown content visibility
    if (dropdownRef) {
      const dropdownContent = dropdownRef.querySelector(".dropdown-content");
      if (dropdownContent) {
        if (dropdownCtx.open()) {
          (dropdownContent as HTMLElement).style.visibility = "visible";
          (dropdownContent as HTMLElement).style.opacity = "1";
        } else {
          (dropdownContent as HTMLElement).style.visibility = "hidden";
          (dropdownContent as HTMLElement).style.opacity = "0";
        }
      }
    }
  });

  const classes = createMemo(() => {
    const isOpen = local.open ?? dropdownCtx.open();
    console.log("Computing dropdown classes, open:", isOpen);
    return twMerge(
      "dropdown",
      local.class,
      local.className,
      clsx({
        "dropdown-left": local.horizontal === "left",
        "dropdown-right": local.horizontal === "right",
        "dropdown-top": local.vertical === "top",
        "dropdown-bottom": local.vertical === "bottom",
        "dropdown-end": local.end,
        "dropdown-hover": local.hover,
        "dropdown-open": isOpen,
      })
    );
  });

  return (
    <DropdownContext.Provider value={dropdownCtx}>
      <div
        role={local.item ? "combobox" : "listbox"}
        {...others}
        data-theme={local.dataTheme}
        class={classes()}
        style={local.style}
        ref={(el) => {
          dropdownRef = el;
          dropdownCtx.ref(el);
        }}
        onClick={dropdownCtx.toggle}
        onMouseEnter={dropdownCtx.onEnter}
        onMouseLeave={dropdownCtx.onLeave}
        aria-label={local["aria-label"]}
        aria-describedby={local["aria-describedby"]}
        aria-expanded={local["aria-expanded"] ?? dropdownCtx.open()}
        aria-haspopup={
          local["aria-haspopup"] === true
            ? "true"
            : local["aria-haspopup"] === false
            ? "false"
            : local["aria-haspopup"] || (local.item ? "listbox" : "true")
        }
        aria-labelledby={local["aria-labelledby"]}
      >
        <Show when={local.item} fallback={<>{local.children}</>}>
          <label tabIndex={0}>{local.children}</label>
          <ul class="dropdown-content" role="listbox">
            {local.item}
          </ul>
        </Show>
      </div>
    </DropdownContext.Provider>
  );
};

export default Object.assign(Dropdown, {
  Details: DropdownDetails,
  Toggle: DropdownToggle,
  Menu: DropdownMenu,
  Item: DropdownItem,
});
