import "./AuthFieldGroup.css";
import type { JSX } from "solid-js";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { authFieldGroup } from "./AuthFieldGroup.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthFieldGroupGap = "sm" | "md" | "lg";

export type AuthFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    gap?: AuthFieldGroupGap;
  };

/* -------------------------------------------------------------------------------------------------
 * AuthFieldGroup
 * -----------------------------------------------------------------------------------------------*/
export const AuthFieldGroupLayout: Layout<typeof authFieldGroup, AuthFieldGroupProps> = () => (
  <div {...slot.root}>{children}</div>
);
