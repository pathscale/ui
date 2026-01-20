import type { JSX } from "solid-js";
import ColorWheel from "./ColorWheel";
import LightnessSlider from "./LightnessSlider";

const ColorPickerWheelSelector = (): JSX.Element => (
  <>
    <ColorWheel />
    <LightnessSlider />
  </>
);

export default ColorPickerWheelSelector;
