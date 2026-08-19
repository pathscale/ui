import "./Alert.css";
import {Show, type Component} from "solid-js";
import { Dynamic, type JSX} from "@solidjs/web";
import type { Flavor, UIBaseProps, Variant } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { alert } from "./Alert.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AlertPlacement = "inline" | "banner";

export type AlertProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  UIBaseProps & {
    flavor?: Flavor;
    variant?: Variant;
    placement?: AlertPlacement;
    title?: JSX.Element;
    /** `false` suppresses the state's default icon. */
    icon?: JSX.Element | false;
    onDismiss?: () => void;
    dismissLabel?: string;
    children: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Default state icons
 * -----------------------------------------------------------------------------------------------*/
const svg = (paths: JSX.Element) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    {paths}
  </svg>
);

const InfoIcon: Component = () =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
    </>,
  );

const SuccessIcon: Component = () =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </>,
  );

const WarningIcon: Component = () =>
  svg(
    <>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        stroke-width="2"
      />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
    </>,
  );

const DangerIcon: Component = () =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
    </>,
  );

const FLAVOR_ICON: Record<string, Component> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  destructive: DangerIcon,
};

/**
 * Only danger and warning interrupt.
 *
 * The old component hardcoded `role="alert"`, which is assertive and cuts
 * across whatever a screen reader is currently saying. That is right for an
 * error and wrong for "codes copied", which was one of the real call sites.
 */
/**
 * Only the urgent flavors interrupt.
 *
 * A hardcoded role="alert" is assertive and cuts across whatever a screen
 * reader is mid-sentence on. Right for an error, wrong for "codes copied".
 */
const ASSERTIVE = new Set(["destructive", "warning"]);

/* -------------------------------------------------------------------------------------------------
 * Alert
 * -----------------------------------------------------------------------------------------------*/
export const AlertLayout: Layout<typeof alert, AlertProps> = () => {
  const role = () => (ASSERTIVE.has(String(local.flavor)) ? "alert" : "status");

  return (
    <div
      {...slot.root}
      role={role()}
      aria-live={role() === "alert" ? "assertive" : "polite"}
      data-flavor={local.flavor ?? "neutral"}
    >
      <Show when={local.icon !== false}>
        <span {...slot.indicator}>
          <Show when={local.icon} fallback={<Dynamic component={FLAVOR_ICON[String(local.flavor)] ?? InfoIcon} />}>
            {local.icon}
          </Show>
        </span>
      </Show>

      <div {...slot.content}>
        <Show when={local.title}>
          <p {...slot.title}>{local.title}</p>
        </Show>
        <span {...slot.description}>{children}</span>
      </div>

      <Show when={local.onDismiss}>
        <button
          {...slot.dismiss}
          type="button"
          onClick={() => local.onDismiss?.()}
          aria-label={local.dismissLabel ?? "Dismiss"}
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="14"
            viewBox="0 0 24 24"
            width="14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
            />
          </svg>
        </button>
      </Show>
    </div>
  );
};
