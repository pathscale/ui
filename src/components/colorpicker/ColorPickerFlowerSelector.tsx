import type { JSX } from "solid-js";
import ColorWheelFlower from "./ColorWheelFlower";
import LightnessSlider from "./LightnessSlider";

const ColorPickerFlowerSelector = (): JSX.Element => (
  <>
    <ColorWheelFlower />
    <LightnessSlider />
  </>
);

export default ColorPickerFlowerSelector;
