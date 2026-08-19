import {
  CardBodyLayout,
  CardFooterLayout,
  CardHeaderLayout,
  CardLayout,
} from "./Card.generated";

/**
 * `Card.Body` is used at 92 call sites across 7 apps, so the compound statics
 * are reattached here. The parts carry their own recipes, which is why this
 * cannot happen inside the Layout template.
 */
const Card = Object.assign(CardLayout, {
  Root: CardLayout,
  Header: CardHeaderLayout,
  Body: CardBodyLayout,
  Content: CardBodyLayout,
  Footer: CardFooterLayout,
});

export type {
  CardElevation,
  CardMaterial,
  CardProps,
  CardSectionProps,
} from "./Card.generated";
export { card, cardBody, cardFooter, cardHeader } from "./Card.recipe";
export {
  Card as default,
  Card,
  CardBodyLayout as CardBody,
  CardFooterLayout as CardFooter,
  CardHeaderLayout as CardHeader,
};
