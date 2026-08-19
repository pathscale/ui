import "./Fieldset.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit, type ParentComponent } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Fieldset.recipe";

export type FieldsetRootProps =
  JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> & UIBaseProps;

export type FieldsetLegendProps = JSX.HTMLAttributes<HTMLLegendElement> &
  UIBaseProps;

export type FieldGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
  };

export type FieldsetActionsProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const FieldsetRoot: Layout<typeof componentRecipe, FieldsetRootProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <fieldset
      {...others}
      {...{ class: twMerge(CLASSES.Root.base, props.class) }}
      data-slot="fieldset"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </fieldset>
  );
};

const FieldsetLegend: Layout<
  typeof componentRecipe,
  FieldsetLegendProps
> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <legend
      {...others}
      {...{ class: twMerge(CLASSES.Legend.base, props.class) }}
      data-slot="fieldset-legend"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </legend>
  );
};

const FieldGroup: Layout<typeof componentRecipe, FieldGroupProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Group.base, props.class) }}
      data-slot="fieldset-field-group"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const FieldsetActions: Layout<
  typeof componentRecipe,
  FieldsetActionsProps
> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Actions.base, props.class) }}
      data-slot="fieldset-actions"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const Fieldset = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Group: FieldGroup,
  Actions: FieldsetActions,
});

export default Fieldset;
export type { FieldsetRootProps as FieldsetProps };
export { FieldGroup, Fieldset, FieldsetActions, FieldsetLegend, FieldsetRoot };
