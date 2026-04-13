import "./Alert.css";
import {
  createContext,
  splitProps,
  useContext,
  Show,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Alert.classes";

/* -------------------------------------------------------------------------------------------------
 * Alert Context
 * -----------------------------------------------------------------------------------------------*/
export type AlertStatus = "default" | "accent" | "success" | "warning" | "danger";

type AlertContextValue = {
  status: () => AlertStatus;
};

const AlertContext = createContext<AlertContextValue>();

const useAlertContext = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("Alert compound components must be used within <Alert>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AlertRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    status?: AlertStatus;
    children: JSX.Element;
  };

export type AlertIndicatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type AlertContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type AlertTitleProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type AlertDescriptionProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Default Status Icons
 * -----------------------------------------------------------------------------------------------*/
const InfoIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
    <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
  </svg>
);

const SuccessIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
  </svg>
);

const WarningIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" />
    <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
  </svg>
);

const DangerIcon = () => (
  <svg
    aria-hidden="true"
    data-slot="alert-default-icon"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
  </svg>
);

const STATUS_ICON_MAP: Record<AlertStatus, Component> = {
  default: InfoIcon,
  accent: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

/* -------------------------------------------------------------------------------------------------
 * Alert Root
 * -----------------------------------------------------------------------------------------------*/
const AlertRoot: ParentComponent<AlertRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "status",
    "dataTheme",
    "style",
  ]);

  const status = () => local.status ?? "default";

  const ctx: AlertContextValue = { status };

  return (
    <AlertContext.Provider value={ctx}>
      <div
        {...others}
        role="alert"
        {...{ class: twMerge(CLASSES.base, CLASSES.status[status()], local.class, local.className) }}
        data-slot="alert-root"
        data-status={status()}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </AlertContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Alert Indicator
 * -----------------------------------------------------------------------------------------------*/
const AlertIndicator: Component<AlertIndicatorProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const ctx = useAlertContext();

  const DefaultIcon = () => {
    const Icon = STATUS_ICON_MAP[ctx.status()];
    return <Icon />;
  };

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.indicator, local.class, local.className) }}
      data-slot="alert-indicator"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show when={local.children} fallback={<DefaultIcon />}>
        {local.children}
      </Show>
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Alert Content
 * -----------------------------------------------------------------------------------------------*/
const AlertContent: ParentComponent<AlertContentProps> = (props) => {
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
      {...{ class: twMerge(CLASSES.slot.content, local.class, local.className) }}
      data-slot="alert-content"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Alert Title
 * -----------------------------------------------------------------------------------------------*/
const AlertTitle: ParentComponent<AlertTitleProps> = (props) => {
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
      {...{ class: twMerge(CLASSES.slot.title, local.class, local.className) }}
      data-slot="alert-title"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </p>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Alert Description
 * -----------------------------------------------------------------------------------------------*/
const AlertDescription: ParentComponent<AlertDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.description, local.class, local.className) }}
      data-slot="alert-description"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Alert = Object.assign(AlertRoot, {
  Root: AlertRoot,
  Indicator: AlertIndicator,
  Content: AlertContent,
  Title: AlertTitle,
  Description: AlertDescription,
});

export default Alert;
export { AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription };
