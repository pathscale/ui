import type { ComponentProps } from "solid-js";

import Popover, {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverDialog,
  PopoverArrow,
  PopoverHeading,
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
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverDialog,
  PopoverArrow,
  PopoverHeading,
};

export default Popover;
