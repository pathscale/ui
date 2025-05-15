import { type Component } from "solid-js";
import {
  progressWrapper,
  progressBar,
  progressFill,
  progressLabel,
} from "./ProgressValue.styles";

const DevShowcaseProgress: Component = () => {
  const value = 40;

  return (
    <div class={progressWrapper()}>
      <div class={progressBar()}>
        <div class={progressFill()} style={{ width: `${value}%` }} />
      </div>
      <div class={progressLabel()}>{value}%</div>
    </div>
  );
};

export default DevShowcaseProgress;
