import "./Card.css";
import { splitProps, type Component, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CardVariant = "default" | "flat" | "bordered" | "shadow";

type CardContextlessProps<T extends HTMLElement> = Omit<JSX.HTMLAttributes<T>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type CardRootProps = CardContextlessProps<HTMLDivElement> & {
  variant?: CardVariant;
  isHoverable?: boolean;
  isPressable?: boolean;
};

export type CardHeaderProps = CardContextlessProps<HTMLDivElement>;
export type CardBodyProps = CardContextlessProps<HTMLDivElement>;
export type CardFooterProps = CardContextlessProps<HTMLDivElement>;

const CARD_VARIANT_CLASS: Record<CardVariant, string> = {
  default: "card--default",
  flat: "card--flat",
  bordered: "card--bordered",
  shadow: "card--shadow",
};

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const CardRoot: ParentComponent<CardRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "isHoverable",
    "isPressable",
    "onKeyDown",
    "role",
    "tabIndex",
  ]);

  const variant = () => local.variant ?? "default";

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented || !local.isPressable) return;

    if (event.key !== "Enter" && event.key !== " ") return;

    if (event.target !== event.currentTarget) return;

    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <div
      {...others}
      class={twMerge(
        "card",
        CARD_VARIANT_CLASS[variant()],
        local.isHoverable && "card--hoverable",
        local.isPressable && "card--pressable",
        local.class,
        local.className,
      )}
      data-slot="card"
      data-variant={variant()}
      data-hoverable={local.isHoverable ? "true" : "false"}
      data-pressable={local.isPressable ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      role={local.role ?? (local.isPressable ? "button" : undefined)}
      tabIndex={local.tabIndex ?? (local.isPressable ? 0 : undefined)}
      onKeyDown={handleKeyDown}
    >
      {local.children}
    </div>
  );
};

const CardHeader: Component<CardHeaderProps> = (props) => {
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
      class={twMerge("card__header", local.class, local.className)}
      data-slot="card-header"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const CardBody: Component<CardBodyProps> = (props) => {
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
      class={twMerge("card__body", local.class, local.className)}
      data-slot="card-body"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const CardFooter: Component<CardFooterProps> = (props) => {
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
      class={twMerge("card__footer", local.class, local.className)}
      data-slot="card-footer"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Content: CardBody,
  Footer: CardFooter,
});

export default Card;
export { Card, CardRoot, CardHeader, CardBody, CardFooter };
export type { CardRootProps as CardProps };
