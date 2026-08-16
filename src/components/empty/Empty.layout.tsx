import "./Empty.css";
import type { JSX } from "@solidjs/web";
import {omit, type Component, type ParentComponent} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Empty.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Empty.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type EmptyRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type EmptyIconProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type EmptyTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type EmptyDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type EmptyActionsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Empty Root
 * -----------------------------------------------------------------------------------------------*/
const EmptyRoot: Layout<typeof componentRecipe, EmptyRootProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      role="status"
      {...{ class: twMerge(CLASSES.base, props.class) }}
      data-slot="empty"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Icon
 * -----------------------------------------------------------------------------------------------*/
const EmptyIcon: Layout<typeof componentRecipe, EmptyIconProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.icon, props.class) }}
      data-slot="empty-icon"
      data-theme={props.dataTheme}
      style={props.style}
      aria-hidden="true"
    >
      {props.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Title
 * -----------------------------------------------------------------------------------------------*/
const EmptyTitle: Layout<typeof componentRecipe, EmptyTitleProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <h3
      {...others}
      {...{ class: twMerge(CLASSES.slot.title, props.class) }}
      data-slot="empty-title"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </h3>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Description
 * -----------------------------------------------------------------------------------------------*/
const EmptyDescription: Layout<typeof componentRecipe, EmptyDescriptionProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <p
      {...others}
      {...{ class: twMerge(CLASSES.slot.description, props.class) }}
      data-slot="empty-description"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </p>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Actions
 * -----------------------------------------------------------------------------------------------*/
const EmptyActions: Layout<typeof componentRecipe, EmptyActionsProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.actions, props.class) }}
      data-slot="empty-actions"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Empty = Object.assign(EmptyRoot, {
  Root: EmptyRoot,
  Icon: EmptyIcon,
  Title: EmptyTitle,
  Description: EmptyDescription,
  Actions: EmptyActions,
});

export default Empty;
export { EmptyRoot, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions };
