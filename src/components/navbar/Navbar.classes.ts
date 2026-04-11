// CSS class contract for the Navbar family.
//
// Compound shape: this single CLASSES const covers Navbar root + the four sub-components
// (Section, Stack, Row) that live in sibling files. Each sub-component file imports CLASSES
// and reads its own slot. This is the pattern for any compound component split across files.
//
// Slots used by this family:
//   - `base`     : always rendered (string or string[])
//   - `variant`  : enum prop value → class (used by Section's `section` prop)
//   - `flag`     : boolean prop name → class (used by Stack and Row)
//   - `color`    : enum prop value → class (used by Row's `color` prop, mapped from ComponentColor)

export const CLASSES = {
  Navbar: {
    base: "navbar",
  },
  Section: {
    variant: {
      start: "navbar-start",
      center: "navbar-center",
      end: "navbar-end",
    },
  },
  Stack: {
    base: "navbar-stack",
    flag: {
      sticky: "sticky top-0 z-30",
      container: "max-w-screen-xl mx-auto px-4",
    },
  },
  Row: {
    base: ["flex", "items-center"],
    flag: {
      bordered: "border-b border-gray-200",
      padded: "px-4 py-2",
    },
    color: {
      ghost: "bg-base-100",
      neutral: "bg-neutral text-neutral-content",
      primary: "bg-primary text-primary-content",
      secondary: "bg-secondary text-secondary-content",
      accent: "bg-accent text-accent-content",
      info: "bg-info text-info-content",
      success: "bg-success text-success-content",
      warning: "bg-warning text-warning-content",
      error: "bg-error text-error-content",
    },
  },
} as const;
