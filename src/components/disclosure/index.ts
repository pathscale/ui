import type { ComponentProps } from "solid-js";

import Disclosure, {
  DisclosureRoot,
  DisclosureHeading,
  DisclosureTrigger,
  DisclosureContent,
  DisclosureBody,
  DisclosureIndicator,
} from "./Disclosure";

export type DisclosureProps = ComponentProps<typeof DisclosureRoot>;
export type DisclosureRootProps = ComponentProps<typeof DisclosureRoot>;
export type DisclosureHeadingProps = ComponentProps<typeof DisclosureHeading>;
export type DisclosureTriggerProps = ComponentProps<typeof DisclosureTrigger>;
export type DisclosureContentProps = ComponentProps<typeof DisclosureContent>;
export type DisclosureBodyProps = ComponentProps<typeof DisclosureBody>;
export type DisclosureIndicatorProps = ComponentProps<typeof DisclosureIndicator>;

export {
  DisclosureRoot,
  DisclosureHeading,
  DisclosureTrigger,
  DisclosureContent,
  DisclosureBody,
  DisclosureIndicator,
};

export default Disclosure;
