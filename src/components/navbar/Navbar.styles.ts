import { cva } from "@src/lib/style";

export const navbarClass = cva("flex items-center px-4", {
  variants: {
    color: {
      primary: "bg-[var(--color-primary)] text-[var(--color-primary-content)]",
      info: "bg-[var(--color-info)] text-[var(--color-info-content)]",
      success: "bg-[var(--color-success)] text-[var(--color-success-content)]",
      danger: "bg-[var(--color-error)] text-[var(--color-error-content)]",
      warning: "bg-[var(--color-warning)] text-[var(--color-warning-content)]",
      light: "bg-[var(--color-base-100)] text-[var(--color-base-content)]",
    },
    spaced: {
      true: "py-4",
      false: "",
    },
    shadow: {
      true: "shadow-md",
      false: "",
    },
    transparent: {
      true: "bg-transparent",
      false: "",
    },
    fixedTop: {
      true: "fixed top-0 left-0 right-0 z-50",
      false: "",
    },
    fixedBottom: {
      true: "fixed bottom-0 left-0 right-0 z-50",
      false: "",
    },
  },
  defaultVariants: {
    color: "primary",
    spaced: false,
    shadow: false,
    transparent: false,
    fixedTop: false,
    fixedBottom: false,
  },
});

export const navbarItemClass = cva(
  "px-4 py-2 rounded transition-colors cursor-pointer",
  {
    variants: {
      active: {
        true: "",
        false: "",
      },
      color: {
        primary: "",
        success: "",
        info: "",
        danger: "",
        warning: "",
        light: "",
      },
    },
    defaultVariants: {
      active: false,
      color: "primary",
    },
    compoundVariants: [
      {
        color: "primary",
        active: true,
        class:
          "bg-[var(--color-primary-content)]/[.2] text-[var(--color-primary-content)]",
      },
      {
        color: "primary",
        active: false,
        class:
          "hover:bg-[var(--color-primary-content)]/[.1] text-[var(--color-primary-content)]",
      },
      {
        color: "success",
        active: true,
        class:
          "bg-[var(--color-success-content)]/[.2] text-[var(--color-success-content)]",
      },
      {
        color: "success",
        active: false,
        class:
          "hover:bg-[var(--color-success-content)]/[.1] text-[var(--color-success-content)]",
      },
      {
        color: "info",
        active: true,
        class:
          "bg-[var(--color-info-content)]/[.2] text-[var(--color-info-content)]",
      },
      {
        color: "info",
        active: false,
        class:
          "hover:bg-[var(--color-info-content)]/[.1] text-[var(--color-info-content)]",
      },
      {
        color: "danger",
        active: true,
        class:
          "bg-[var(--color-error-content)]/[.2] text-[var(--color-error-content)]",
      },
      {
        color: "danger",
        active: false,
        class:
          "hover:bg-[var(--color-error-content)]/[.1] text-[var(--color-error-content)]",
      },
      {
        color: "warning",
        active: true,
        class:
          "bg-[var(--color-warning-content)]/[.2] text-[var(--color-warning-content)]",
      },
      {
        color: "warning",
        active: false,
        class:
          "hover:bg-[var(--color-warning-content)]/[.1] text-[var(--color-warning-content)]",
      },
      {
        color: "light",
        active: true,
        class: "bg-[var(--color-base-300)] text-[var(--color-base-content)]",
      },
      {
        color: "light",
        active: false,
        class:
          "hover:bg-[var(--color-base-200)] text-[var(--color-base-content)]",
      },
    ],
  }
);

export const navbarDropdownClass = cva("relative", {
  variants: {
    hoverable: {
      true: "group",
      false: "",
    },
  },
  defaultVariants: {
    hoverable: true,
  },
});

export const dropdownMenuClass = cva(
  "absolute mt-2 bg-[var(--color-base-100)] text-[var(--color-base-content)] rounded shadow-lg hidden group-hover:block",
  {
    variants: {
      align: {
        left: "left-0",
        right: "right-0",
      },
    },
    defaultVariants: {
      align: "left",
    },
  }
);
