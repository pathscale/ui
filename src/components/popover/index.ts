import type { ComponentProps } from "solid-js";

import Popover, {
  PopoverArrow,
  PopoverContent,
  PopoverDialog,
  PopoverHeading,
  PopoverRoot,
  PopoverTrigger,
} from "./Popover.generated";

export type PopoverProps = ComponentProps<typeof PopoverRoot>;
export type PopoverRootProps = ComponentProps<typeof PopoverRoot>;
export type PopoverTriggerProps = ComponentProps<typeof PopoverTrigger>;
export type PopoverContentProps = ComponentProps<typeof PopoverContent>;
export type PopoverDialogProps = ComponentProps<typeof PopoverDialog>;
export type PopoverArrowProps = ComponentProps<typeof PopoverArrow>;
export type PopoverHeadingProps = ComponentProps<typeof PopoverHeading>;
export type { PopoverAnchor, PopoverAnchorRect } from "./Popover.generated";

export {
  PopoverArrow,
  PopoverContent,
  PopoverDialog,
  PopoverHeading,
  PopoverRoot,
  PopoverTrigger,
};

export default Popover;
