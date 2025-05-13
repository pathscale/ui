import { type Component, Show } from "solid-js";
import {
  progressWrapper,
  progressBar,
  progressFill,
  progressLabel,
  progressVariants,
} from "./ProgressValue.styles";

interface ProgressProps {
  value: number | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  variant?: "filled" | "outlined" | "ghost";
  showValue?: boolean;
  format?: "percent" | "raw";
  color?: "danger" | "success" | "info" | "warning" | "default";
}

const Progress: Component<ProgressProps> = ({
  value,
  size = "md",
  shape = "rounded",
  variant = "filled",
  showValue = false,
  format = "raw",
  color = "default",
}) => {
  const displayValue = () =>
    format === "percent" && value != null ? `${value}%` : value;

  return (
    <div class={`${progressWrapper()} ${progressVariants({ size, shape, variant })}`}>
      <div class={progressBar()}>
        <Show
          when={value != null}
          fallback={
            <div class={`${progressFill({ color })} animate-pulse`} style={{ width: "100%" }} />
          }
        >
          <div class={progressFill({ color })} style={{ width: `${value}%` }} />
        </Show>
      </div>
      {showValue && value != null && (
        <div class={progressLabel()}>{displayValue()}</div>
      )}
    </div>
  );
};

export default Progress;
