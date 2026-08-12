import { ChipLabel, ChipRoot } from "./Chip.generated";

const Chip = Object.assign(ChipRoot, {
  Root: ChipRoot,
  Label: ChipLabel,
});

export default Chip;

export { Chip, ChipRoot, ChipLabel };

export type {
  ChipRootProps,
  ChipRootProps as ChipProps,
  ChipLabelProps,
  ChipVariant,
  ChipColor,
  ChipSize,
} from "./Chip.generated";
