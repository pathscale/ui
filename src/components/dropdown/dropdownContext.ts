import { createSignal, onMount, onCleanup } from "solid-js";

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
  disabled = false
): DropdownContextType {
  const [open, setOpen] = createSignal(false);
  let ref: HTMLDivElement | undefined;

  const toggle = () => {
    if (!disabled && trigger === "click") {
      setOpen((v) => !v);
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
