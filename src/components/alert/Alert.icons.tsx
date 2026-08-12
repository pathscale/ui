import type { Component } from "solid-js";

import type { AlertStatus } from "./Alert.context";

/**
 * The icon an alert falls back to when the caller gives its indicator no
 * children. Markup, so it lives beside the markup.
 *
 * `data-slot="alert-default-icon"` is what `Alert.css` sizes and colours these
 * by, and is the one `data-slot` in the library the recipe does not generate:
 * these are children of a slot rather than slots themselves.
 */

const InfoIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="2"
    />
    <path
      d="M12 16v-4M12 8h.01"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="2"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="currentColor"
      stroke-width="2"
    />
    <path
      d="M12 9v4M12 17h.01"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    />
  </svg>
);

const DangerIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="2"
    />
    <path
      d="M15 9l-6 6M9 9l6 6"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    />
  </svg>
);

export const STATUS_ICON: Record<AlertStatus, Component> = {
  default: InfoIcon,
  accent: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};
