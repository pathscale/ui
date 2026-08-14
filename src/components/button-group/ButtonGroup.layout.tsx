import "./ButtonGroup.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import { CLASSES } from "./ButtonGroup.recipe";
import { ButtonGroupContext } from "./context";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ButtonGroup.recipe";
import type { Size, Variant, State, UIBaseProps } from "../vocabulary";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export type ButtonGroupRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    orientation?: ButtonGroupOrientation;
    size?: Size;
    variant?: Variant;
    state?: State;
    fullWidth?: boolean;
  };

export type ButtonGroupSeparatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps;

const ButtonGroupRoot: Layout<typeof componentRecipe, ButtonGroupRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "orientation",
    "size",
    "variant",
    "state",
    "fullWidth",
    "role",
  ]);

  const orientation = () => local.orientation ?? "horizontal";

  return (
    <ButtonGroupContext.Provider
      value={{
        size: () => local.size,
        variant: () => local.variant,
        isDisabled: () => (local.state === "disabled"),
        fullWidth: () => local.fullWidth,
      }}
    >
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.orientation[orientation()],
          local.fullWidth && CLASSES.Root.flag.fullWidth,
          local.class,
        ) }}
        data-slot="button-group"
        data-orientation={orientation()}
        data-theme={local.dataTheme}
        style={local.style}
        role={local.role ?? "group"}
        aria-disabled={(local.state === "disabled") ? "true" : undefined}
      >
        {local.children}
      </div>
    </ButtonGroupContext.Provider>
  );
};

const ButtonGroupSeparator: Layout<typeof componentRecipe, ButtonGroupSeparatorProps> = () => {
  const [local, others] = splitProps(props, ["class", "dataTheme", "style"]);

  return (
    <span
      {...others}
      aria-hidden="true"
      {...{ class: twMerge(CLASSES.Separator.base, local.class) }}
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
