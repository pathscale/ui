import "./AuthCard.css";
import { Show, type JSX } from "solid-js";
import Card from "../card";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { authCard } from "./AuthCard.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthCardProps = UIBaseProps & {
  title?: JSX.Element;
  description?: JSX.Element;
  children: JSX.Element;
  footer?: JSX.Element;
  brandingSlot?: JSX.Element;
};

/* -------------------------------------------------------------------------------------------------
 * AuthCard
 *
 * The header block is omitted entirely when it would be empty, so a card with
 * only a form does not carry a stray flex row that contributes gap.
 * -----------------------------------------------------------------------------------------------*/
export const AuthCardLayout: Layout<typeof authCard, AuthCardProps> = () => (
  <Card {...slot.root} elevation="md">
    <Card.Body {...slot.body}>
      <Show when={local.title || local.description || local.brandingSlot}>
        <div {...slot.header}>
          <div {...slot.headings}>
            <Show when={local.title}>
              <h2 {...slot.title}>{local.title}</h2>
            </Show>
            <Show when={local.description}>
              <p {...slot.description}>{local.description}</p>
            </Show>
          </div>
          <Show when={local.brandingSlot}>
            <div {...slot.branding}>{local.brandingSlot}</div>
          </Show>
        </div>
      </Show>

      {children}
    </Card.Body>

    <Show when={local.footer}>
      <Card.Footer {...slot.footer}>{local.footer}</Card.Footer>
    </Show>
  </Card>
);
