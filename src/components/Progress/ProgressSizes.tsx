import { type Component } from "solid-js";
import {
  progressWrapper,
  progressBar,
  progressFill,
  progressLabel,
  progressVariants,
} from "./ProgressValue.styles";

interface ProgressProps {
  value: number;
  size?: "sm" | "md" | "lg"; // Maps from is-small, is-medium, is-large
  shape?: "circle" | "rounded";
  variant?: "filled" | "outlined" | "ghost";
}

const Progress: Component<ProgressProps> = ({
  value,
  size = "md",
  shape = "rounded",
  variant = "filled",
}) => {
  return (
    <div class={`${progressWrapper()} ${progressVariants({ size, shape, variant })}`}>
      <div class={progressBar()}>
        <div
          class={progressFill()}
          style={{ width: `${value}%` }}
        />
      </div>
      <div class={progressLabel()}>{value}%</div>
    </div>
  );
};

export default Progress;
