import "./Fieldset.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Fieldset.classes";

export type FieldsetRootProps = JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> & IComponentBaseProps;

export type FieldsetLegendProps = JSX.HTMLAttributes<HTMLLegendElement> & IComponentBaseProps;

export type FieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type FieldsetActionsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const FieldsetRoot: ParentComponent<FieldsetRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <fieldset
      {...others}
      {...{ class: twMerge(CLASSES.Root.base, local.class, local.className) }}
      data-slot="fieldset"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </fieldset>
  );
};

const FieldsetLegend: ParentComponent<FieldsetLegendProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <legend
      {...others}
      {...{ class: twMerge(CLASSES.Legend.base, local.class, local.className) }}
      data-slot="fieldset-legend"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </legend>
  );
};

const FieldGroup: ParentComponent<FieldGroupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Group.base, local.class, local.className) }}
      data-slot="fieldset-field-group"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const FieldsetActions: ParentComponent<FieldsetActionsProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Actions.base, local.class, local.className) }}
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
