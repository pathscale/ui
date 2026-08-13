// @pathscale/ui/lab — components with no adopted call site across the fleet.
//
// Nothing here is deleted or deprecated. They are parked off the main surface
// so that surface reflects what is actually in use; import them from
// "@pathscale/ui/lab" and they behave exactly as before.

export {
  default as ComboBox,
  ComboBoxInputGroup,
  ComboBoxInput,
  ComboBoxTrigger,
  ComboBoxPopover,
  ComboBoxList,
} from "./components/combo-box";
export type {
  ComboBoxProps,
  ComboBoxRootProps,
  ComboBoxInputGroupProps,
  ComboBoxInputProps,
  ComboBoxTriggerProps,
  ComboBoxPopoverProps,
  ComboBoxListProps,
  ComboBoxListRenderItem,
  ComboBoxVariant,
  ComboBoxMenuTrigger,
  ComboBoxItem,
  ComboBoxKey,
} from "./components/combo-box";
export {
  default as Menu,
  MenuItem,
  MenuItemIndicator,
  MenuItemSubmenuIndicator,
  MenuSection,
} from "./components/menu";
export type {
  MenuProps,
  MenuRootProps,
  MenuSelectionMode,
  MenuItemProps,
  MenuItemRootProps,
  MenuItemIndicatorProps,
  MenuItemSubmenuIndicatorProps,
  MenuItemRenderProps,
  MenuItemVariant,
  MenuSectionProps,
  MenuSectionRootProps,
} from "./components/menu";
export {
  default as Meter,
  MeterOutput,
  MeterTrack,
  MeterFill,
} from "./components/meter";
export type {
  MeterProps,
  MeterRootProps,
  MeterOutputProps,
  MeterTrackProps,
  MeterFillProps,
  MeterSize,
  MeterColor,
  MeterRenderState,
} from "./components/meter";
export { default as ProgressCircle } from "./components/progress-circle";
export type {
  ProgressCircleProps,
  ProgressCircleSize,
  ProgressCircleColor,
} from "./components/progress-circle";
export {
  default as Kbd,
  KbdAbbr,
  KbdContent,
  kbdKeysMap,
  kbdKeysLabelMap,
} from "./components/kbd";
export type {
  KbdProps,
  KbdRootProps,
  KbdAbbrProps,
  KbdContentProps,
  KbdVariant,
  KbdKey,
} from "./components/kbd";
export { default as Join } from "./components/join";
export {
  default as ButtonGroup,
  ButtonGroupSeparator,
} from "./components/button-group";
export type {
  ButtonGroupProps,
  ButtonGroupRootProps,
  ButtonGroupSeparatorProps,
  ButtonGroupOrientation,
} from "./components/button-group";
export { default as CheckboxGroup } from "./components/checkbox-group";
export type {
  CheckboxGroupProps,
  CheckboxGroupVariant,
} from "./components/checkbox-group";
export { default as CloseButton } from "./components/close-button";
export type {
  CloseButtonProps,
  CloseButtonVariant,
} from "./components/close-button";
export { default as NoiseBackground } from "./components/noise-background";
export type { NoiseBackgroundProps } from "./components/noise-background";
export {
  VideoPreview,
  type VideoPreviewProps,
} from "./components/video-preview";
export {
  SizePicker,
  createSizeStore,
  getDefaultSizeStore,
} from "./components/size-picker";
export type {
  SizePickerProps,
  SizeStore,
  SizePreset,
} from "./components/size-picker";
export {
  default as Toolbar,
} from "./components/toolbar";
export type {
  ToolbarProps,
  ToolbarRootProps,
  ToolbarOrientation,
} from "./components/toolbar";
export { default as ColorArea } from "./components/color-area";
export type { ColorAreaProps, ColorAreaValue } from "./components/color-area";
export { default as ColorField } from "./components/color-field";
export type {
  ColorFieldProps,
  ColorFieldFormat,
} from "./components/color-field";
export { default as ColorPicker } from "./components/color-picker";
export type {
  ColorPickerProps,
  ColorPickerAreaProps,
  ColorPickerSliderProps,
  ColorPickerFieldProps,
} from "./components/color-picker";
export { default as ColorSlider } from "./components/color-slider";
export type {
  ColorSliderProps,
  ColorSliderType,
} from "./components/color-slider";
export { default as ColorSwatchPicker } from "./components/color-swatch-picker";
export type { ColorSwatchPickerProps } from "./components/color-swatch-picker";
export { ColorWheelFlower } from "./components/color-wheel-flower";
export {
  COLOR_WHEEL_FLOWER_COLOR_COUNT,
  COLOR_WHEEL_FLOWER_PALETTES,
  resolveColorWheelFlowerPalette,
} from "./components/color-wheel-flower";
export type {
  ColorWheelFlowerMode,
  ColorWheelFlowerProps,
} from "./components/color-wheel-flower";
export {
  default as DateField,
  DateFieldGroup,
  DateFieldInput,
  DateFieldInputContainer,
  DateFieldSegment,
  DateFieldPrefix,
  DateFieldSuffix,
} from "./components/date-field";
export type {
  DateFieldProps,
  DateFieldRootProps,
  DateFieldGroupProps,
  DateFieldInputProps,
  DateFieldInputContainerProps,
  DateFieldSegmentProps,
  DateFieldPrefixProps,
  DateFieldSuffixProps,
  DateFieldVariant,
  DateFieldRenderProps,
  DateFieldSegmentValue,
} from "./components/date-field";
export {
  default as DatePicker,
  type DatePickerProps,
} from "./components/date-picker";
export {
  default as DateRangePicker,
  type DateRangePickerProps,
  type DateRangeValue,
} from "./components/date-range-picker";
export {
  default as RangeCalendar,
  type RangeCalendarProps,
  type RangeCalendarValue,
} from "./components/range-calendar";
export {
  default as TimeField,
  TimeFieldGroup,
  TimeFieldInput,
  TimeFieldInputContainer,
  TimeFieldSegment,
  TimeFieldPrefix,
  TimeFieldSuffix,
} from "./components/time-field";
export type {
  TimeFieldProps,
  TimeFieldRootProps,
  TimeFieldGroupProps,
  TimeFieldInputProps,
  TimeFieldInputContainerProps,
  TimeFieldSegmentProps,
  TimeFieldPrefixProps,
  TimeFieldSuffixProps,
  TimeFieldVariant,
  TimeFieldRenderProps,
  TimeFieldSegmentValue,
} from "./components/time-field";
