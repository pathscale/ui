import { cva } from "@src/lib/style"

export const timelineWrapperClass = "relative"

export const timelineItemClass = cva(
  "relative flex items-center gap-3 min-h-[48px]",
  {
    variants: {
      state: {
        default: "text-[var(--color-fg-secondary)]",
        active: "text-[var(--color-fg-success)] font-medium",
        error: "text-[var(--color-fg-error)] font-medium",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

export const timelineMarkerWrapperClass =
  "relative w-6 min-h-[48px] flex items-center justify-center"

export const timelineLineClass =
  "absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[var(--color-bg-tertiary)]"

export const timelineMarkerClass =
  "absolute w-3 h-3 rounded-full border-2 border-[var(--color-bg-body)] bg-[var(--color-bg-secondary)] z-10"

export const timelineNumberClass = cva(
  "absolute -left-4 top-1/2 -translate-y-1/2 text-xs font-semibold",
  {
    variants: {
      state: {
        default: "text-[var(--color-fg-secondary)]",
        active: "text-[var(--color-fg-success)]",
        error: "text-[var(--color-fg-error)]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

export const timelineContentClass = "pt-0.5 text-sm"
