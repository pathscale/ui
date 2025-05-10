import { cva } from "@src/lib/style";

export const buttonVariants = cva(
  [
    "inline-flex items-center font-medium outline-none select-none",
    "not-disabled:cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-25",
    "aria-busy:cursor-wait",
    "transition active:transition-none",
  ],
  {
    variants: {
      size: {
        sm: "text-sm leading-tight",
        md: "text-base leading-tight",
        lg: "text-lg leading-tight",
      },
      color: {
        inverse: "",
        primary: "",
        secondary: "",
        tertiary: "",
        accent: "",
        positive: "",
        destructive: "",
      },
      align: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
      },
      shape: {
        circle: "rounded-full",
        rounded: "rounded-lg",
      },
      spacing: {
        0: "gap-0 p-0",
        xs: "gap-1.5 px-1.5 py-1.5",
        sm: "gap-1.5 px-2 py-2",
        md: "gap-1.5 px-3 py-2",
        lg: "gap-1.5 px-3.5 py-2.5",
      },
      loading: {
        true: "",
        false: "",
      },
      stretched: {
        true: "w-full",
        false: "w-fit",
      },
      variant: {
        fill: [
          "not-disabled:hover:opacity-75 not-disabled:active:opacity-50",
          "aria-[current]:opacity-75 data-expanded:opacity-75 data-open:opacity-75",
          "focus-visible:opacity-75",
        ],
        gray: [
          "bg-bg-primary not-disabled:hover:bg-bg-secondary not-disabled:active:bg-bg-secondary not-disabled:active:opacity-75",
          "aria-[current]:bg-bg-secondary data-expanded:bg-bg-secondary data-open:bg-bg-secondary",
          "focus-visible:bg-bg-secondary",
        ],
        ghost: [
          "not-disabled:hover:bg-bg-primary not-disabled:active:bg-bg-primary not-disabled:active:opacity-75",
          "aria-[current]:bg-bg-primary data-expanded:bg-bg-primary data-open:bg-bg-primary",
          "focus-visible:bg-bg-primary",
        ],
      },
    },
    compoundVariants: [
      {
        variant: "fill",
        color: "inverse",
        class: "bg-bg-inverse text-fg-inverse",
      },
      {
        variant: "fill",
        color: "primary",
        class: "bg-bg-primary text-fg-body",
      },
      {
        variant: "fill",
        color: "secondary",
        class: "bg-bg-secondary text-fg-body",
      },
      {
        variant: "fill",
        color: "tertiary",
        class: "bg-bg-tertiary text-fg-body",
      },
      {
        variant: "fill",
        color: "accent",
        class: "bg-bg-accent text-light",
      },
      {
        variant: "fill",
        color: "positive",
        class: "bg-bg-positive text-light",
      },
      {
        variant: "fill",
        color: "destructive",
        class: "bg-bg-destructive text-light",
      },
      {
        variant: "gray",
        color: "inverse",
        class: "text-fg-inverse",
      },
      {
        variant: "gray",
        color: "primary",
        class: "text-fg-primary",
      },
      {
        variant: "gray",
        color: "secondary",
        class: "text-fg-secondary",
      },
      {
        variant: "gray",
        color: "tertiary",
        class: "text-fg-tertiary",
      },
      {
        variant: "gray",
        color: "accent",
        class: "text-fg-accent",
      },
      {
        variant: "gray",
        color: "positive",
        class: "text-fg-positive",
      },
      {
        variant: "gray",
        color: "destructive",
        class: "text-fg-destructive",
      },
      {
        variant: "ghost",
        color: "inverse",
        class: "text-fg-inverse",
      },
      {
        variant: "ghost",
        color: "primary",
        class: "text-fg-primary",
      },
      {
        variant: "ghost",
        color: "secondary",
        class: "text-fg-secondary",
      },
      {
        variant: "ghost",
        color: "tertiary",
        class: "text-fg-tertiary",
      },
      {
        variant: "ghost",
        color: "accent",
        class: "text-fg-accent",
      },
      {
        variant: "ghost",
        color: "positive",
        class: "text-fg-positive",
      },
      {
        variant: "ghost",
        color: "destructive",
        class: "text-fg-destructive",
      },
    ],
    defaultVariants: {
      size: "md",
      color: "primary",
      align: "center",
      shape: "rounded",
      spacing: "md",
      variant: "fill",
      loading: false,
      stretched: false,
    },
  },
);
