import type { Component } from "solid-js";
import { spinnerIconBaseClass } from "./Select.styles";

const SpinnerIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={`${spinnerIconBaseClass} ${props.class ?? ""}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export default SpinnerIcon;
