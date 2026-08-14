import "./Fieldset.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Fieldset.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Fieldset.recipe";

export type FieldsetRootProps = JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> & UIBaseProps;

export type FieldsetLegendProps = JSX.HTMLAttributes<HTMLLegendElement> & UIBaseProps;

export type FieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

export type FieldsetActionsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const FieldsetRoot: Layout<typeof componentRecipe, FieldsetRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <fieldset
      {...others}
      {...{ class: twMerge(CLASSES.Root.base, local.class) }}
      data-slot="fieldset"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </fieldset>
  );
};

const FieldsetLegend: Layout<typeof componentRecipe, FieldsetLegendProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <legend
      {...others}
      {...{ class: twMerge(CLASSES.Legend.base, local.class) }}
      data-slot="fieldset-legend"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </legend>
  );
};

const FieldGroup: Layout<typeof componentRecipe, FieldGroupProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Group.base, local.class) }}
      data-slot="fieldset-field-group"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const FieldsetActions: Layout<typeof componentRecipe, FieldsetActionsProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Actions.base, local.class) }}
      data-slot="fieldset-actions"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
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
export { Fieldset, FieldsetRoot, FieldsetLegend, FieldGroup, FieldsetActions };
export type { FieldsetRootProps as FieldsetProps };
