import {
  type Component,
  splitProps,
  type JSX,
  createMemo,
  Show,
} from "solid-js";
import type { ComponentProps } from "solid-js";
import { useDropdown } from "./useDropdown";
import DropdownMenu from "./DropdownMenu";
import { dropdownVariants } from "./Dropdown.styles";
import { buttonVariants } from "../button/Button.styles";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";

type DropdownProps = {
  label?: string | JSX.Element;
  disabledLabel?: string | JSX.Element;
  trigger?: "click" | "hover";
  children: JSX.Element;
  color?: "primary" | "secondary" | "default";
  disabled?: boolean;
  className?: string;
} & VariantProps<typeof dropdownVariants> &
  ClassProps &
  ComponentProps<"div">;

const Dropdown: Component<DropdownProps> = (props) => {
  const [localProps, variantProps, restProps] = splitProps(
    props,
    ["label", "disabledLabel", "trigger", "children", "disabled", "color", "class", "className"],
    Object.keys(dropdownVariants.variantKeys ?? {}) as (keyof VariantProps<typeof dropdownVariants>)[]
  );

  const { open, ref, toggle, onEnter, onLeave } = useDropdown(
    localProps.trigger ?? "click",
    !!localProps.disabled
  );

  const labelContent = createMemo(() =>
    localProps.disabled
      ? localProps.disabledLabel ?? localProps.label
      : localProps.label ?? "Toggle"
  );

  const containerClass = createMemo(() =>
    classes("relative inline-block", localProps.class, localProps.className)
  );

  const buttonClass = createMemo(() =>
    buttonVariants({
      color: "primary",
    })
  );

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      class={containerClass()}
      {...restProps}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (localProps.trigger === "click") toggle();
        }}
        class={buttonClass()}
        aria-disabled={localProps.disabled}
        disabled={localProps.disabled}
        aria-controls="dropdown-menu"
      >
        {labelContent()}
      </button>

      <Show when={open()}>
        <DropdownMenu open {...variantProps}>
          {localProps.children}
        </DropdownMenu>
      </Show>
    </div>
  );
};

export default Dropdown;
