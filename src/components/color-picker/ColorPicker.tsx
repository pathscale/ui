import "./ColorPicker.css";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import ColorArea, { type ColorAreaProps, type ColorAreaValue } from "../color-area";
import ColorField, { type ColorFieldProps } from "../color-field";
import ColorSlider, { type ColorSliderProps, type ColorSliderType } from "../color-slider";
import { formatColor, parseColor, rgbToHex } from "../color-wheel-flower/ColorUtils";
import type { IComponentBaseProps } from "../types";

const DEFAULT_COLOR = "#3B82F6";

type NormalizedColorState = {
  hex: string;
  hsv: ColorAreaValue;
  alpha: number;
};

type ColorPickerContextValue = {
  value: Accessor<NormalizedColorState>;
  isDisabled: Accessor<boolean>;
  setFromArea: (value: ColorAreaValue) => void;
  setFromField: (value: string) => void;
  setFromSlider: (type: ColorSliderType, value: number) => void;
};

const ColorPickerContext = createContext<ColorPickerContextValue>();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeHue = (value: number) => ((value % 360) + 360) % 360;

const normalizeHsv = (value: ColorAreaValue): ColorAreaValue => ({
  h: normalizeHue(value.h),
  s: clamp(value.s, 0, 100),
  v: clamp(value.v, 0, 100),
});

const normalizeAlpha = (value: number) => clamp(value, 0, 1);

const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return prefixed.toUpperCase();
};

const rgbToHsv = (r: number, g: number, b: number): ColorAreaValue => {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      hue = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      hue = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  const saturation = max === 0 ? 0 : (delta / max) * 100;
  const brightness = max * 100;

  return normalizeHsv({
    h: hue,
    s: saturation,
    v: brightness,
  });
};

const hsvToRgb = (h: number, s: number, v: number) => {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const brightness = clamp(v, 0, 100) / 100;

  const chroma = brightness * saturation;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const match = brightness - chroma;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (huePrime >= 0 && huePrime < 1) {
    rPrime = chroma;
    gPrime = x;
  } else if (huePrime < 2) {
    rPrime = x;
    gPrime = chroma;
  } else if (huePrime < 3) {
    gPrime = chroma;
    bPrime = x;
  } else if (huePrime < 4) {
    gPrime = x;
    bPrime = chroma;
  } else if (huePrime < 5) {
    rPrime = x;
    bPrime = chroma;
  } else {
    rPrime = chroma;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + match) * 255),
    g: Math.round((gPrime + match) * 255),
    b: Math.round((bPrime + match) * 255),
  };
};

const formatOutputColor = (value: NormalizedColorState) => {
  if (value.alpha >= 1) {
    return value.hex;
  }

  const rgb = hsvToRgb(value.hsv.h, value.hsv.s, value.hsv.v);
  const alpha = Number(value.alpha.toFixed(2));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const toColorState = (value?: string | null): NormalizedColorState | null => {
  if (!value) return null;

  const parsed = parseColor(value);
  if (!parsed) return null;

  const hex = normalizeHex(formatColor(parsed, "hex"));
  const hsv = rgbToHsv(parsed.rgb.r, parsed.rgb.g, parsed.rgb.b);
  const alpha = normalizeAlpha(parsed.rgb.a ?? 1);

  return { hex, hsv, alpha };
};

const fallbackState = (): NormalizedColorState => {
  const parsed = toColorState(DEFAULT_COLOR);
  if (parsed) return parsed;

  return {
    hex: DEFAULT_COLOR,
    hsv: { h: 0, s: 75, v: 96 },
    alpha: 1,
  };
};

export type ColorPickerAreaProps = Omit<ColorAreaProps, "value" | "onChange" | "isDisabled"> & {
  onChange?: (value: ColorAreaValue) => void;
};

const ColorPickerArea: Component<ColorPickerAreaProps> = (props) => {
  const ctx = useContext(ColorPickerContext);
  const [local, others] = splitProps(props, ["class", "className", "onChange", "dataTheme"]);

  if (!ctx) {
    return (
      <ColorArea
        {...others}
        class={twMerge("color-picker__area", local.class, local.className)}
        dataTheme={local.dataTheme}
        onChange={local.onChange}
      />
    );
  }

  const handleChange = (next: ColorAreaValue) => {
    ctx.setFromArea(next);
    local.onChange?.(next);
  };

  return (
    <ColorArea
      {...others}
      value={ctx.value().hsv}
      isDisabled={ctx.isDisabled()}
      class={twMerge("color-picker__area", local.class, local.className)}
      dataTheme={local.dataTheme}
      onChange={handleChange}
    />
  );
};

export type ColorPickerSliderProps = Omit<ColorSliderProps, "value" | "onChange" | "isDisabled"> & {
  onChange?: (value: number) => void;
};

const ColorPickerSlider: Component<ColorPickerSliderProps> = (props) => {
  const ctx = useContext(ColorPickerContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "onChange",
    "type",
    "style",
    "dataTheme",
  ]);

  const sliderType = () => local.type ?? "hue";

  if (!ctx) {
    return (
      <ColorSlider
        {...others}
        type={sliderType()}
        class={twMerge("color-picker__slider", local.class, local.className)}
        dataTheme={local.dataTheme}
        style={local.style}
        onChange={local.onChange}
      />
    );
  }

  const value = () => (sliderType() === "alpha" ? ctx.value().alpha : ctx.value().hsv.h);

  const handleChange = (next: number) => {
    ctx.setFromSlider(sliderType(), next);
    local.onChange?.(next);
  };

  const sliderStyle = (): JSX.CSSProperties => {
    const userStyle = local.style as JSX.CSSProperties | undefined;

    if (sliderType() !== "alpha") {
      return { ...userStyle };
    }

    const rgb = hsvToRgb(ctx.value().hsv.h, ctx.value().hsv.s, ctx.value().hsv.v);

    return {
      "--color-slider-alpha-color": `rgb(${rgb.r} ${rgb.g} ${rgb.b})`,
      ...userStyle,
    };
  };

  return (
    <ColorSlider
      {...others}
      type={sliderType()}
      value={value()}
      isDisabled={ctx.isDisabled()}
      class={twMerge("color-picker__slider", local.class, local.className)}
      dataTheme={local.dataTheme}
      style={sliderStyle()}
      onChange={handleChange}
    />
  );
};

export type ColorPickerFieldProps = Omit<ColorFieldProps, "value" | "onChange" | "isDisabled"> & {
  onChange?: (value: string) => void;
};

const ColorPickerField: Component<ColorPickerFieldProps> = (props) => {
  const ctx = useContext(ColorPickerContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "onChange",
    "fullWidth",
    "format",
    "dataTheme",
  ]);

  if (!ctx) {
    return (
      <ColorField
        {...others}
        class={twMerge("color-picker__field", local.class, local.className)}
        dataTheme={local.dataTheme}
        format={local.format}
        fullWidth={local.fullWidth ?? true}
        onChange={local.onChange}
      />
    );
  }

  const handleChange = (next: string) => {
    ctx.setFromField(next);
    local.onChange?.(next);
  };

  return (
    <ColorField
      {...others}
      value={ctx.value().hex}
      isDisabled={ctx.isDisabled()}
      class={twMerge("color-picker__field", local.class, local.className)}
      dataTheme={local.dataTheme}
      format={local.format}
      fullWidth={local.fullWidth ?? true}
      onChange={handleChange}
    />
  );
};

export type ColorPickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    isDisabled?: boolean;
  };

const ColorPickerRoot: Component<ColorPickerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "value",
    "defaultValue",
    "onChange",
    "isDisabled",
    "dataTheme",
  ]);

  const [internalState, setInternalState] = createSignal(
    toColorState(local.value ?? local.defaultValue) ?? fallbackState(),
  );

  const isControlled = () => local.value !== undefined;

  createEffect(() => {
    if (!isControlled()) return;

    const next = toColorState(local.value);
    if (next) {
      setInternalState(next);
    }
  });

  const currentState = createMemo(() => {
    if (!isControlled()) {
      return internalState();
    }

    return toColorState(local.value) ?? internalState();
  });

  const emitChange = (next: NormalizedColorState) => {
    if (!isControlled()) {
      setInternalState(next);
    }
    local.onChange?.(formatOutputColor(next));
  };

  const setFromArea = (nextValue: ColorAreaValue) => {
    const hsv = normalizeHsv(nextValue);
    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const hex = normalizeHex(rgbToHex(rgb.r, rgb.g, rgb.b));

    emitChange({ hex, hsv, alpha: currentState().alpha });
  };

  const setFromSlider = (type: ColorSliderType, value: number) => {
    if (type === "alpha") {
      emitChange({
        ...currentState(),
        alpha: normalizeAlpha(value),
      });
      return;
    }

    const hsv = normalizeHsv({
      ...currentState().hsv,
      h: value,
    });
    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const hex = normalizeHex(rgbToHex(rgb.r, rgb.g, rgb.b));

    emitChange({
      hex,
      hsv,
      alpha: currentState().alpha,
    });
  };

  const setFromField = (nextValue: string) => {
    const next = toColorState(nextValue);
    if (!next) return;
    emitChange(next);
  };

  const context = createMemo<ColorPickerContextValue>(() => ({
    value: currentState,
    isDisabled: () => Boolean(local.isDisabled),
    setFromArea,
    setFromField,
    setFromSlider,
  }));

  return (
    <ColorPickerContext.Provider value={context()}>
      <div
        {...others}
        class={twMerge("color-picker", local.class, local.className)}
        data-theme={local.dataTheme}
        data-slot="color-picker"
        data-disabled={local.isDisabled ? "true" : "false"}
      >
        {local.children ?? (
          <>
            <ColorPickerArea />
            <ColorPickerSlider type="hue" />
            <ColorPickerField />
          </>
        )}
      </div>
    </ColorPickerContext.Provider>
  );
};

const ColorPicker = Object.assign(ColorPickerRoot, {
  Root: ColorPickerRoot,
  Area: ColorPickerArea,
  Slider: ColorPickerSlider,
  Field: ColorPickerField,
});

export {
  ColorPicker as default,
  ColorPicker,
  ColorPickerRoot,
  ColorPickerArea,
  ColorPickerSlider,
  ColorPickerField,
};
