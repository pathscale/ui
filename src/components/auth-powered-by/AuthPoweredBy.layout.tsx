import "./AuthPoweredBy.css";
import type { JSX } from "@solidjs/web";
import {Show} from "solid-js";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { authPoweredBy } from "./AuthPoweredBy.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthPoweredByAlign = "left" | "center" | "right";
export type AuthPoweredByVariant = "subtle" | "card" | "inline";

export type AuthPoweredByProps = UIBaseProps & {
  label?: string;
  logo?: JSX.Element;
  href?: string;
  align?: AuthPoweredByAlign;
  variant?: AuthPoweredByVariant;
};

const DEFAULT_LABEL = "Secure Auth by Honey";
const DEFAULT_HREF = "https://honey.id/";

/* -------------------------------------------------------------------------------------------------
 * AuthPoweredBy
 * -----------------------------------------------------------------------------------------------*/
export const AuthPoweredByLayout: Layout<typeof authPoweredBy, AuthPoweredByProps> = () => (
  <div {...slot.root}>
    <a
      {...slot.link}
      href={local.href ?? DEFAULT_HREF}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span {...slot.content}>
        <Show when={local.logo}>
          <span {...slot.logo} aria-hidden="true">
            {local.logo}
          </span>
        </Show>
        <span>{local.label ?? DEFAULT_LABEL}</span>
      </span>
    </a>
  </div>
);
