import {
  CardLayout,
  CardHeaderLayout,
  CardBodyLayout,
  CardFooterLayout,
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

export { Card as default, Card, CardHeaderLayout as CardHeader, CardBodyLayout as CardBody, CardFooterLayout as CardFooter };
export type { CardProps, CardSectionProps, CardMaterial, CardElevation } from "./Card.generated";
export { card, cardHeader, cardBody, cardFooter } from "./Card.recipe";
