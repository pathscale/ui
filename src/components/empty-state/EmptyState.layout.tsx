import "./EmptyState.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./EmptyState.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./EmptyState.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type EmptyStateRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyStateIconProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyStateTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyStateDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type EmptyStateActionsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * EmptyState Root
 * -----------------------------------------------------------------------------------------------*/
const EmptyStateRoot: Layout<typeof componentRecipe, EmptyStateRootProps> = () => {
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
      data-slot="empty-state"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * EmptyState Icon
 * -----------------------------------------------------------------------------------------------*/
const EmptyStateIcon: Layout<typeof componentRecipe, EmptyStateIconProps> = () => {
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
      data-slot="empty-state-icon"
      data-theme={local.dataTheme}
      style={local.style}
      aria-hidden="true"
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * EmptyState Title
 * -----------------------------------------------------------------------------------------------*/
const EmptyStateTitle: Layout<typeof componentRecipe, EmptyStateTitleProps> = () => {
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
      data-slot="empty-state-title"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h3>
  );
};

/* -------------------------------------------------------------------------------------------------
 * EmptyState Description
 * -----------------------------------------------------------------------------------------------*/
const EmptyStateDescription: Layout<typeof componentRecipe, EmptyStateDescriptionProps> = () => {
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
      data-slot="empty-state-description"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </p>
  );
};

/* -------------------------------------------------------------------------------------------------
 * EmptyState Actions
 * -----------------------------------------------------------------------------------------------*/
const EmptyStateActions: Layout<typeof componentRecipe, EmptyStateActionsProps> = () => {
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
      data-slot="empty-state-actions"
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
const EmptyState = Object.assign(EmptyStateRoot, {
  Root: EmptyStateRoot,
  Icon: EmptyStateIcon,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});

export default EmptyState;
export { EmptyStateRoot, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };
