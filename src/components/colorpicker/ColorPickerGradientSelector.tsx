import type { JSX } from "solid-js";
import SaturationBrightness from "./SaturationBrightness";
import HueSlider from "./HueSlider";

const ColorPickerGradientSelector = (): JSX.Element => (
  <>
    <SaturationBrightness />
    <HueSlider />
  </>
);

export default ColorPickerGradientSelector;
