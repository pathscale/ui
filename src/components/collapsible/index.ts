import type { ComponentProps } from "solid-js";

import Collapsible, {
  CollapsibleBody,
  CollapsibleContent,
  CollapsibleHeading,
  CollapsibleIndicator,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "./Collapsible.generated";

export type CollapsibleProps = ComponentProps<typeof CollapsibleRoot>;
export type CollapsibleRootProps = ComponentProps<typeof CollapsibleRoot>;
export type CollapsibleHeadingProps = ComponentProps<typeof CollapsibleHeading>;
export type CollapsibleTriggerProps = ComponentProps<typeof CollapsibleTrigger>;
export type CollapsibleContentProps = ComponentProps<typeof CollapsibleContent>;
export type CollapsibleBodyProps = ComponentProps<typeof CollapsibleBody>;
export type CollapsibleIndicatorProps = ComponentProps<
  typeof CollapsibleIndicator
>;

export {
  CollapsibleBody,
  CollapsibleContent,
  CollapsibleHeading,
  CollapsibleIndicator,
  CollapsibleRoot,
  CollapsibleTrigger,
};

export default Collapsible;
