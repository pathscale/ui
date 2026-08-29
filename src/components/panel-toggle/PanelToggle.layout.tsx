import "./PanelToggle.css";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { panelToggle } from "./PanelToggle.recipe";

export type PanelToggleSide = "left" | "right";

export type PanelToggleProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "id" | "aria-label" | "aria-expanded" | "type"
> &
  UIBaseProps & {
    /** Required so inspection and QA can address this control without its copy. */
    id: string;
    /** Whether the panel controlled by this gutter tab is visible. */
    expanded: boolean;
    /** The side of the content on which the controlled panel lives. */
    side?: PanelToggleSide;
    /** Names the action in the current state, for example “Hide details”. */
    "aria-label": string;
    /** The id of the panel this button expands and collapses. */
    "aria-controls"?: string;
  };

/** A standard vertical tab that lives in the gutter beside a collapsible panel. */
export const PanelToggleLayout: Layout<typeof panelToggle, PanelToggleProps> = () => {
  const rest = omit(
    props,
    "id",
    "expanded",
    "side",
    "aria-label",
    "aria-controls",
    "children",
    "class",
    "style",
  );

  return (
    <button
      {...rest}
      {...slot.root}
      id={local.id}
      type="button"
      aria-label={local["aria-label"]}
      aria-controls={local["aria-controls"]}
      aria-expanded={local.expanded ? "true" : "false"}
      data-expanded={local.expanded ? "true" : "false"}
      data-side={local.side ?? "right"}
    >
      <span {...slot.indicator} aria-hidden="true" />
    </button>
  );
};
