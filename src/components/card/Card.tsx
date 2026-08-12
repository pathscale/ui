import "./Card.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import defaults from "./Card.defaults";
import {
  CardBodyLayout,
  CardFooterLayout,
  CardHeaderLayout,
  CardRootLayout,
} from "./Card.layout";
import { createCard } from "./Card.logic";
import { card } from "./Card.recipe";

export type CardVariant = "default" | "flat" | "bordered" | "shadow";

type CardContextlessProps<T extends HTMLElement> = Omit<
  JSX.HTMLAttributes<T>,
  "children"
> &
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

const CardRoot = defineComponent({
  recipe: card,
  name: "Card",
  defaults: defaults.Card,
  behaviour: ["onKeyDown", "role", "tabIndex"],
  setup: createCard,
  layout: CardRootLayout,
}) as unknown as (props: CardRootProps) => JSX.Element;

const CardHeader = defineComponent({
  recipe: card,
  name: "CardHeader",
  slot: "header",
  layout: CardHeaderLayout,
}) as unknown as (props: CardHeaderProps) => JSX.Element;

const CardBody = defineComponent({
  recipe: card,
  name: "CardBody",
  slot: "body",
  layout: CardBodyLayout,
}) as unknown as (props: CardBodyProps) => JSX.Element;

const CardFooter = defineComponent({
  recipe: card,
  name: "CardFooter",
  slot: "footer",
  layout: CardFooterLayout,
}) as unknown as (props: CardFooterProps) => JSX.Element;

/** `Content` is kept as an alias for `Body`; callers use both. */
const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Content: CardBody,
  Footer: CardFooter,
});

export default Card;
export type { CardRootProps as CardProps };
export { Card, CardBody, CardFooter, CardHeader, CardRoot };
