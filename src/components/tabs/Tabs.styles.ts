import { cva } from "@src/lib/style"

export const tabsNavVariants = cva(
  "flex text-sm font-medium text-[var(--color-fg-secondary)]",
  {
    variants: {
      type: {
        basic: "",
        boxed: "flex gap-2",
        toggle: "inline-flex rounded-md p-1",
        "toggle-rounded": "inline-flex rounded-full p-1",
      },
      size: {
        sm: "text-xs gap-1",
        md: "text-sm gap-2",
        lg: "text-base gap-3",
      },
      alignment: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      },
      expanded: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      type: "basic",
      size: "md",
      alignment: "left",
      expanded: false,
    },
  }
)

export const tabTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium text-sm transition-colors",
  {
    variants: {
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-2",
        lg: "text-base px-4 py-3",
      },
      type: {
        basic: "border-b-2 transition-colors hover:text-[var(--color-fg-accent)]",
        boxed: "rounded-t px-4 py-2 hover:text-[var(--color-fg-accent)]",
        toggle:
          "border -ml-px px-4 py-2 transition-colors first:ml-0 first:rounded-l-md last:rounded-r-md",
        "toggle-rounded":
          "border -ml-px first:ml-0 first:rounded-l-full last:rounded-r-full transition-colors",
      },
      active: {
        true: "",
        false: "",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    compoundVariants: [
      {
        type: "basic",
        active: true,
        class: "border-[var(--color-bg-accent)] text-[var(--color-fg-accent)]",
      },
      {
        type: "basic",
        active: false,
        class: "border-transparent text-[var(--color-fg-secondary)]",
      },
      {
        type: "boxed",
        active: true,
        class:
          "border-x border-t border-b-0 border-[var(--color-bg-tertiary)] text-[var(--color-fg-accent)]",
      },
      {
        type: "boxed",
        active: false,
        class:
          "border-b border-transparent text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-accent)]",
      },
      {
        type: "toggle",
        active: true,
        class: "bg-[var(--color-bg-accent)] text-white border-[var(--color-bg-accent)]",
      },
      {
        type: "toggle",
        active: false,
        class:
          "bg-transparent text-[var(--color-fg-secondary)] border-[var(--color-bg-tertiary)]",
      },
      {
        type: "toggle-rounded",
        active: true,
        class: "bg-[var(--color-bg-accent)] text-white border-[var(--color-bg-accent)]",
      },
      {
        type: "toggle-rounded",
        active: false,
        class:
          "bg-transparent text-[var(--color-fg-secondary)] border-[var(--color-bg-tertiary)]",
      },
    ],
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
)
