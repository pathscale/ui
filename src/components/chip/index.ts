import { ChipLabel, ChipRoot } from "./Chip.generated";

const Chip: typeof ChipRoot & {
  Root: typeof ChipRoot;
  Label: typeof ChipLabel;
} = Object.assign(ChipRoot, {
  Root: ChipRoot,
  Label: ChipLabel,
});

export default Chip;

export type {
  ChipColor,
  ChipLabelProps,
  ChipRootProps,
  ChipRootProps as ChipProps,
  ChipSize,
  ChipVariant,
} from "./Chip.generated";
export { Chip, ChipLabel, ChipRoot };
