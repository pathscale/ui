import "./Empty.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Empty.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Empty.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type EmptyRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyIconProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyActionsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Empty Root
 * -----------------------------------------------------------------------------------------------*/
const EmptyRoot: Layout<typeof componentRecipe, EmptyRootProps> = () => {
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
      role="status"
      {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
      data-slot="empty"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Icon
 * -----------------------------------------------------------------------------------------------*/
const EmptyIcon: Layout<typeof componentRecipe, EmptyIconProps> = () => {
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
      {...{ class: twMerge(CLASSES.slot.icon, local.class, local.className) }}
      data-slot="empty-icon"
      data-theme={local.dataTheme}
      style={local.style}
      aria-hidden="true"
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Title
 * -----------------------------------------------------------------------------------------------*/
const EmptyTitle: Layout<typeof componentRecipe, EmptyTitleProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <h3
      {...others}
      {...{ class: twMerge(CLASSES.slot.title, local.class, local.className) }}
      data-slot="empty-title"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h3>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Description
 * -----------------------------------------------------------------------------------------------*/
const EmptyDescription: Layout<typeof componentRecipe, EmptyDescriptionProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <p
      {...others}
      {...{ class: twMerge(CLASSES.slot.description, local.class, local.className) }}
      data-slot="empty-description"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </p>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Empty Actions
 * -----------------------------------------------------------------------------------------------*/
const EmptyActions: Layout<typeof componentRecipe, EmptyActionsProps> = () => {
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
      {...{ class: twMerge(CLASSES.slot.actions, local.class, local.className) }}
      data-slot="empty-actions"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
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
