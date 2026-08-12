import "./Alert.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import type { AlertStatus } from "./Alert.context";
import defaults from "./Alert.defaults";
import {
  AlertContentLayout,
  AlertDescriptionLayout,
  AlertIndicatorLayout,
  AlertRootLayout,
  AlertTitleLayout,
} from "./Alert.layout";
import { alert } from "./Alert.recipe";

export type { AlertStatus };

export type AlertRootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    status?: AlertStatus;
    children: JSX.Element;
  };

export type AlertIndicatorProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type AlertContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type AlertTitleProps = Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "children"
> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type AlertDescriptionProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

const AlertRoot = defineComponent({
  recipe: alert,
  name: "Alert",
  defaults: defaults.Alert,
  layout: AlertRootLayout,
}) as unknown as (props: AlertRootProps) => JSX.Element;

/**
 * The four parts are the same recipe's other slots. None of them takes
 * presentation props — they inherit the alert's status through the context the
 * root provides, which is what lets the indicator pick a default icon.
 */
const AlertIndicator = defineComponent({
  recipe: alert,
  name: "AlertIndicator",
  slot: "indicator",
  layout: AlertIndicatorLayout,
}) as unknown as (props: AlertIndicatorProps) => JSX.Element;

const AlertContent = defineComponent({
  recipe: alert,
  name: "AlertContent",
  slot: "content",
  layout: AlertContentLayout,
}) as unknown as (props: AlertContentProps) => JSX.Element;

const AlertTitle = defineComponent({
  recipe: alert,
  name: "AlertTitle",
  slot: "title",
  layout: AlertTitleLayout,
}) as unknown as (props: AlertTitleProps) => JSX.Element;

const AlertDescription = defineComponent({
  recipe: alert,
  name: "AlertDescription",
  slot: "description",
  layout: AlertDescriptionLayout,
}) as unknown as (props: AlertDescriptionProps) => JSX.Element;

const Alert = Object.assign(AlertRoot, {
  Root: AlertRoot,
  Indicator: AlertIndicator,
  Content: AlertContent,
  Title: AlertTitle,
  Description: AlertDescription,
});

export default Alert;
export {
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertRoot,
  AlertTitle,
};
