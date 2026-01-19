import { type JSX, createSignal, onMount, onCleanup } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { createColorFromHsl } from "./ColorUtils";

export interface LightnessSliderProps {
  class?: string;
  className?: string;
}

const LightnessSlider = (props: LightnessSliderProps): JSX.Element => {
  const context = useColorPickerContext();
  const [isDragging, setIsDragging] = createSignal(false);
  let sliderRef: HTMLDivElement | undefined;

  const lightness = () => context.color().hsl.l;

  const updateLightness = (clientX: number) => {
    if (!sliderRef || context.disabled()) return;

    const rect = sliderRef.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newLightness = Math.round(percentage * 100);

    const newColor = createColorFromHsl(
      context.color().hsl.h,
      context.color().hsl.s,
      newLightness,
      context.color().hsl.a,
    );
    context.onChange(newColor);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (context.disabled()) return;
    setIsDragging(true);
    updateLightness(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      updateLightness(e.clientX);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (context.disabled()) return;

    const step = e.shiftKey ? 10 : 1;
    let newL = lightness();

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        newL = Math.max(0, newL - step);
        e.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowUp":
        newL = Math.min(100, newL + step);
        e.preventDefault();
        break;
      default:
        return;
    }

    const newColor = createColorFromHsl(
      context.color().hsl.h,
      context.color().hsl.s,
      newL,
      context.color().hsl.a,
    );
    context.onChange(newColor);
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  const classes = () =>
    twMerge(
      "relative w-full h-6 rounded cursor-pointer select-none",
      clsx({
        "opacity-50 cursor-not-allowed": context.disabled(),
      }),
      props.class,
      props.className,
    );

  const thumbClasses = () =>
    twMerge(
      "absolute top-1/2 w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none",
      clsx({
        "ring-2 ring-primary": isDragging(),
      }),
    );

  const gradientStyle = () => {
    const h = context.color().hsl.h;
    const s = context.color().hsl.s;
    return `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`;
  };

  return (
    <div
      ref={sliderRef}
      class={classes()}
      style={{
        background: gradientStyle(),
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={context.disabled() ? -1 : 0}
      role="slider"
      aria-label="Lightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={lightness()}
      aria-disabled={context.disabled()}
    >
      <div
        class={thumbClasses()}
        style={{
          left: `${lightness()}%`,
          "background-color": `hsl(${context.color().hsl.h}, ${context.color().hsl.s}%, ${lightness()}%)`,
        }}
      />
    </div>
  );
};

export default LightnessSlider;
