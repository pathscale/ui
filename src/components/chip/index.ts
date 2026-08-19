import { ChipLabel, ChipRoot } from "./Chip.generated";

const Chip = Object.assign(ChipRoot, {
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
