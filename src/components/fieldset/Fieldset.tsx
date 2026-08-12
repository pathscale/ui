import "./Fieldset.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import {
  FieldGroupLayout,
  FieldsetActionsLayout,
  FieldsetLegendLayout,
  FieldsetRootLayout,
} from "./Fieldset.layout";
import { fieldset } from "./Fieldset.recipe";

export type FieldsetRootProps =
  JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> & IComponentBaseProps;

export type FieldsetLegendProps = JSX.HTMLAttributes<HTMLLegendElement> &
  IComponentBaseProps;

export type FieldGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type FieldsetActionsProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

/**
 * `disabled` is not listed anywhere: `<fieldset disabled>` is plain HTML and
 * the fourth prop bucket carries it to the element, where the browser already
 * knows what it means.
 */
const FieldsetRoot = defineComponent({
  recipe: fieldset,
  name: "Fieldset",
  layout: FieldsetRootLayout,
}) as unknown as (props: FieldsetRootProps) => JSX.Element;

const FieldsetLegend = defineComponent({
  recipe: fieldset,
  name: "FieldsetLegend",
  slot: "legend",
  layout: FieldsetLegendLayout,
}) as unknown as (props: FieldsetLegendProps) => JSX.Element;

const FieldGroup = defineComponent({
  recipe: fieldset,
  name: "FieldGroup",
  slot: "group",
  layout: FieldGroupLayout,
}) as unknown as (props: FieldGroupProps) => JSX.Element;

const FieldsetActions = defineComponent({
  recipe: fieldset,
  name: "FieldsetActions",
  slot: "actions",
  layout: FieldsetActionsLayout,
}) as unknown as (props: FieldsetActionsProps) => JSX.Element;

const Fieldset = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Group: FieldGroup,
  Actions: FieldsetActions,
});

export default Fieldset;
export type { FieldsetRootProps as FieldsetProps };
export { FieldGroup, Fieldset, FieldsetActions, FieldsetLegend, FieldsetRoot };
