import "./ButtonGroup.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { ButtonSize, ButtonVariant } from "../button";
import type { IComponentBaseProps } from "../types";
import { ButtonGroupContext } from "./ButtonGroupContext";

export type ButtonGroupOrientation = "horizontal" | "vertical";

const ORIENTATION_CLASS_MAP: Record<ButtonGroupOrientation, string> = {
  horizontal: "button-group--horizontal",
  vertical: "button-group--vertical",
};

export type ButtonGroupRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    orientation?: ButtonGroupOrientation;
    size?: ButtonSize;
    variant?: ButtonVariant;
    isDisabled?: boolean;
    fullWidth?: boolean;
  };

export type ButtonGroupSeparatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps;

const ButtonGroupRoot: ParentComponent<ButtonGroupRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "orientation",
    "size",
    "variant",
    "isDisabled",
    "fullWidth",
    "role",
  ]);

  const orientation = () => local.orientation ?? "horizontal";

  return (
    <ButtonGroupContext.Provider
      value={{
        size: () => local.size,
        variant: () => local.variant,
        isDisabled: () => local.isDisabled,
        fullWidth: () => local.fullWidth,
      }}
    >
      <div
        {...others}
        class={twMerge(
          "button-group",
          ORIENTATION_CLASS_MAP[orientation()],
          local.fullWidth && "button-group--full-width",
          local.class,
          local.className,
        )}
        data-slot="button-group"
        data-orientation={orientation()}
        data-theme={local.dataTheme}
        style={local.style}
        role={local.role ?? "group"}
        aria-disabled={local.isDisabled ? "true" : undefined}
      >
        {local.children}
      </div>
    </ButtonGroupContext.Provider>
  );
};

const ButtonGroupSeparator: Component<ButtonGroupSeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style"]);

  return (
    <span
      {...others}
      aria-hidden="true"
      class={twMerge("button-group__separator", local.class, local.className)}
      data-slot="button-group-separator"
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});

export default ButtonGroup;
export { ButtonGroup, ButtonGroupRoot, ButtonGroupSeparator };
export type { ButtonGroupRootProps as ButtonGroupProps };
