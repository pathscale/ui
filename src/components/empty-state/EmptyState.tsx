import "./EmptyState.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

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
const EmptyStateRoot: ParentComponent<EmptyStateRootProps> = (props) => {
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
      class={twMerge("empty-state", local.class, local.className)}
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
const EmptyStateIcon: Component<EmptyStateIconProps> = (props) => {
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
      class={twMerge("empty-state__icon", local.class, local.className)}
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
const EmptyStateTitle: ParentComponent<EmptyStateTitleProps> = (props) => {
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
      class={twMerge("empty-state__title", local.class, local.className)}
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
const EmptyStateDescription: ParentComponent<EmptyStateDescriptionProps> = (props) => {
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
      class={twMerge("empty-state__description", local.class, local.className)}
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
const EmptyStateActions: ParentComponent<EmptyStateActionsProps> = (props) => {
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
      class={twMerge("empty-state__actions", local.class, local.className)}
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
