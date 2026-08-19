import "./ButtonGroup.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit, type ParentComponent } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Size, State, UIBaseProps, Variant } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ButtonGroup.recipe";
import { ButtonGroupContext } from "./context";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export type ButtonGroupRootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
    orientation?: ButtonGroupOrientation;
    size?: Size;
    variant?: Variant;
    state?: State;
    fullWidth?: boolean;
  };

export type ButtonGroupSeparatorProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  UIBaseProps;

const ButtonGroupRoot: Layout<
  typeof componentRecipe,
  ButtonGroupRootProps
> = () => {
  const others = omit(
    props,
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
  );

  const orientation = () => props.orientation ?? "horizontal";

  return (
    <ButtonGroupContext
      value={{
        size: () => props.size,
        variant: () => props.variant,
        isDisabled: () => props.state === "disabled",
        fullWidth: () => props.fullWidth,
      }}
    >
      <div
        {...others}
        {...{
          class: twMerge(
            CLASSES.Root.base,
            CLASSES.Root.orientation[orientation()],
            props.fullWidth && CLASSES.Root.flag.fullWidth,
            props.class,
          ),
        }}
        data-slot="button-group"
        data-orientation={orientation()}
        data-theme={props.dataTheme}
        style={props.style}
        role={props.role ?? "group"}
        aria-disabled={props.state === "disabled" ? "true" : undefined}
      >
        {props.children}
      </div>
    </ButtonGroupContext>
  );
};

const ButtonGroupSeparator: Layout<
  typeof componentRecipe,
  ButtonGroupSeparatorProps
> = () => {
  const others = omit(props, "class", "dataTheme", "style");

  return (
    <span
      {...others}
      aria-hidden="true"
      {...{ class: twMerge(CLASSES.Separator.base, props.class) }}
      data-slot="button-group-separator"
      data-theme={props.dataTheme}
      style={props.style}
    />
  );
};

const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});

export default ButtonGroup;
export type { ButtonGroupRootProps as ButtonGroupProps };
export { ButtonGroup, ButtonGroupRoot, ButtonGroupSeparator };
