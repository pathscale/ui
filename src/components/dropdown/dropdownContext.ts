import { createSignal, onMount, onCleanup, createContext } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type DropdownContextType = {
  setOpen: (open: boolean) => void;
  open: () => boolean;
  ref: (el: HTMLDivElement) => void;
  toggle: () => void;
  onEnter: () => void;
  onLeave: () => void;
};

export function useDropdown(
  trigger: "click" | "hover",
  disabled = false,
): DropdownContextType {
  const [open, setOpenState] = createSignal(false);
  let ref: HTMLDivElement | undefined;

  const toggle = () => {
    if (!disabled && trigger === "click") {
      setOpen(!open());
    }
  };

  const onEnter = () => {
    if (!disabled && trigger === "hover") setOpen(true);
  };
  const onLeave = () => {
    if (!disabled && trigger === "hover") setOpen(false);
  };

  const onClickOutside = (e: MouseEvent) => {
    if (trigger === "click" && ref && !ref.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  // Custom setOpen function that handles blur when closing
  const setOpen = (value: boolean) => {
    if (value === false) {
      // When closing, first remove focus
      if (ref) {
        // Remove focus from any focusable elements within the dropdown
        const focusableElements = ref.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        focusableElements.forEach((el) => {
          (el as HTMLElement).blur();
        });

        // Also blur the dropdown element itself
        ref.blur();
      }

      // Then set state to closed
      setOpenState(false);
    } else {
      // When opening, set state immediately
      setOpenState(true);
    }
  };

  onMount(() => {
    document.addEventListener("click", onClickOutside);
    onCleanup(() => document.removeEventListener("click", onClickOutside));
  });

  return {
    setOpen,
    open,
    ref: (el: HTMLDivElement) => (ref = el),
    toggle,
    onEnter,
    onLeave,
  };
}

// Shared context used by Dropdown, DropdownItem, and DropdownDetails
export const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined,
);

// Shared class-name builder used by Dropdown and DropdownDetails
export type ClassesFnProps = {
  className?: string;
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
}: ClassesFnProps) =>
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
    }),
  );
