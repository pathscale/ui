import "./ButtonGroup.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { ButtonSize, ButtonVariant } from "../button";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ButtonGroup.classes";
import { ButtonGroupContext } from "./context";

export type ButtonGroupOrientation = "horizontal" | "vertical";

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
          CLASSES.Root.base,
          CLASSES.Root.orientation[orientation()],
          local.fullWidth && CLASSES.Root.flag.fullWidth,
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
      class={twMerge(CLASSES.Separator.base, local.class, local.className)}
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
