import { type JSX, createSignal, onMount, onCleanup } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { createColorFromHsl } from "./ColorUtils";

export interface HueSliderProps {
  class?: string;
  className?: string;
}

const HueSlider = (props: HueSliderProps): JSX.Element => {
  const context = useColorPickerContext();
  const [isDragging, setIsDragging] = createSignal(false);
  let sliderRef: HTMLDivElement | undefined;

  const hue = () => context.color().hsl.h;

  const updateHue = (clientX: number) => {
    if (!sliderRef || context.disabled()) return;

    const rect = sliderRef.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newHue = Math.round(percentage * 360);

    const newColor = createColorFromHsl(
      newHue,
      context.color().hsl.s,
      context.color().hsl.l,
      context.color().hsl.a,
    );
    context.onChange(newColor);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (context.disabled()) return;
    setIsDragging(true);
    updateHue(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      updateHue(e.clientX);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (context.disabled()) return;

    const step = e.shiftKey ? 10 : 1;
    let newHue = hue();

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        newHue = (hue() - step + 360) % 360;
        e.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowUp":
        newHue = (hue() + step) % 360;
        e.preventDefault();
        break;
      default:
        return;
    }

    const newColor = createColorFromHsl(
      newHue,
      context.color().hsl.s,
      context.color().hsl.l,
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

  return (
    <div
      ref={sliderRef}
      class={classes()}
      style={{
        background:
          "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={context.disabled() ? -1 : 0}
      role="slider"
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={hue()}
      aria-disabled={context.disabled()}
    >
      <div
        class={thumbClasses()}
        style={{
          left: `${(hue() / 360) * 100}%`,
          "background-color": `hsl(${hue()}, 100%, 50%)`,
        }}
      />
    </div>
  );
};

export default HueSlider;
