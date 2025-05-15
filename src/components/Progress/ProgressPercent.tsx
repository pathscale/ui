import { type Component } from "solid-js";
import {
  progressWrapper,
  progressBar,
  progressFill,
  progressLabel,
  progressVariants,
} from "./ProgressValue.styles";

export interface ProgressProps {
  value: number;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  variant?: "filled" | "outlined" | "ghost";
  showValue?: boolean;
  format?: "percent" | "raw";
}

const Progress: Component<ProgressProps> = ({
  value,
  size = "md",
  shape = "rounded",
  variant = "filled",
  showValue = false,
  format = "raw",
}) => {
  const displayValue = () => {
    return format === "percent" ? `${value}%` : value;
  };

  return (
    <div
      class={`${progressWrapper()} ${progressVariants({
        size,
        shape,
        variant,
      })}`}
    >
      <div class={progressBar()}>
        <div class={progressFill()} style={{ width: `${value}%` }} />
      </div>
      {showValue && <div class={progressLabel()}>{displayValue()}</div>}
    </div>
  );
};

export default Progress;
