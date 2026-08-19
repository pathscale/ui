import { BadgeAnchor, BadgeLabel, BadgeRoot } from "./Badge.generated";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Badge = Object.assign(BadgeRoot, {
  Anchor: BadgeAnchor,
  Label: BadgeLabel,
  Root: BadgeRoot,
});

export default Badge;

export type {
  BadgeAnchorProps,
  BadgeLabelProps,
  BadgeRootProps,
  BadgeRootProps as BadgeProps,
} from "./Badge.generated";
/* -------------------------------------------------------------------------------------------------
 * Named Exports
 * -----------------------------------------------------------------------------------------------*/
export { Badge, BadgeAnchor, BadgeLabel, BadgeRoot };
