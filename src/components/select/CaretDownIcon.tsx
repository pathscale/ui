import type { Component } from "solid-js";
import { caretIconBaseClass } from "./Select.styles";

const CaretDownIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={`${caretIconBaseClass} ${props.class ?? ""}`}
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    viewBox="0 0 24 24"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default CaretDownIcon;
