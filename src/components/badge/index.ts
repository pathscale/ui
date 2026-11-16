import { BadgeAnchor, BadgeLabel, BadgeRoot } from "./Badge.generated";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Badge: typeof BadgeRoot & {
  Anchor: typeof BadgeAnchor;
  Label: typeof BadgeLabel;
  Root: typeof BadgeRoot;
} = Object.assign(BadgeRoot, {
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
