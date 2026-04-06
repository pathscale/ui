import { BadgeAnchor, BadgeLabel, BadgeRoot } from "./Badge";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Badge = Object.assign(BadgeRoot, {
  Anchor: BadgeAnchor,
  Label: BadgeLabel,
  Root: BadgeRoot,
});

export default Badge;

/* -------------------------------------------------------------------------------------------------
 * Named Exports
 * -----------------------------------------------------------------------------------------------*/
export { Badge, BadgeRoot, BadgeLabel, BadgeAnchor };

export type {
  BadgeRootProps,
  BadgeRootProps as BadgeProps,
  BadgeLabelProps,
  BadgeAnchorProps,
} from "./Badge";
