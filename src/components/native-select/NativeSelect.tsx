import "./NativeSelect.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";

export type NativeSelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement> &
  UIBaseProps;

/**
 * The browser's native semantic combobox with the shared UI prop boundary.
 *
 * Use this when the operating-system picker and native option semantics are
 * the desired behavior. Use `Select` when the application needs UI's custom
 * popover, compound options, or multiple selection.
 */
const NativeSelect: Component<NativeSelectProps> = (props) => {
  const others = omit(props, "class", "dataTheme", "style", "children");

  return (
    <select
      {...others}
      class={twMerge("native-select", props.class)}
      data-slot="native-select"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </select>
  );
};

export default NativeSelect;
