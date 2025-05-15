// src/hooks/useDropdown.ts
import { createSignal, onMount, onCleanup } from "solid-js";

export function useDropdown(trigger: "click" | "hover", disabled = false) {
  const [open, setOpen] = createSignal(false);
  let ref: HTMLDivElement | undefined;

  const toggle = () => {
    if (!disabled && trigger === "click") {
      setOpen(v => !v);
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
    open,
    ref: (el: HTMLDivElement) => (ref = el),
    toggle,
    onEnter,
    onLeave,
  };
}