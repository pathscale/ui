import { type Component } from "solid-js";
import {
  progressWrapper,
  progressBar,
  progressFill,
  progressLabel,
  progressVariants,
} from "./ProgressValue.styles";

export interface ProgressValueProps {
  value: number;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  variant?: "filled" | "outlined" | "ghost";
}

const ProgressValue: Component<ProgressValueProps> = (props) => {
  return (
    <div
      class={`${progressWrapper()} ${progressVariants({
        size: props.size,
        shape: props.shape,
        variant: props.variant,
      })}`}
    >
      <div class={progressBar()}>
        <div class={progressFill()} style={{ width: `${props.value}%` }} />
      </div>
      <div class={progressLabel()}>{props.value}%</div>
    </div>
  );
};

export default ProgressValue;
