import type { ComponentProps } from "solid-js";

import Collapsible, {
  CollapsibleRoot,
  CollapsibleHeading,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleBody,
  CollapsibleIndicator,
} from "./Collapsible.generated";

export type CollapsibleProps = ComponentProps<typeof CollapsibleRoot>;
export type CollapsibleRootProps = ComponentProps<typeof CollapsibleRoot>;
export type CollapsibleHeadingProps = ComponentProps<typeof CollapsibleHeading>;
export type CollapsibleTriggerProps = ComponentProps<typeof CollapsibleTrigger>;
export type CollapsibleContentProps = ComponentProps<typeof CollapsibleContent>;
export type CollapsibleBodyProps = ComponentProps<typeof CollapsibleBody>;
export type CollapsibleIndicatorProps = ComponentProps<typeof CollapsibleIndicator>;

export {
  CollapsibleRoot,
  CollapsibleHeading,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleBody,
  CollapsibleIndicator,
};

export default Collapsible;
