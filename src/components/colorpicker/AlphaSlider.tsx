import { type JSX, createSignal, onMount, onCleanup } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { setAlpha } from "./ColorUtils";

export interface AlphaSliderProps {
  class?: string;
  className?: string;
}

const AlphaSlider = (props: AlphaSliderProps): JSX.Element => {
  const context = useColorPickerContext();
  const [isDragging, setIsDragging] = createSignal(false);
  let sliderRef: HTMLDivElement | undefined;

  const alpha = () => context.color().hsl.a;

  const updateAlpha = (clientX: number) => {
    if (!sliderRef || context.disabled()) return;

    const rect = sliderRef.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newAlpha = Math.round(percentage * 100) / 100;

    const newColor = setAlpha(context.color(), newAlpha);
    context.onChange(newColor);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (context.disabled()) return;
    setIsDragging(true);
    updateAlpha(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      updateAlpha(e.clientX);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (context.disabled()) return;

    const step = e.shiftKey ? 0.1 : 0.01;
    let newAlpha = alpha();

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        newAlpha = Math.max(0, alpha() - step);
        e.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowUp":
        newAlpha = Math.min(1, alpha() + step);
        e.preventDefault();
        break;
      default:
        return;
    }

    const newColor = setAlpha(context.color(), newAlpha);
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
      "relative w-full h-6 rounded cursor-pointer select-none overflow-hidden",
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
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={context.disabled() ? -1 : 0}
      role="slider"
      aria-label="Alpha (opacity)"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={alpha()}
      aria-disabled={context.disabled()}
    >
      <div
        class="absolute inset-0"
        style={{
          "background-image":
            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
          "background-size": "8px 8px",
          "background-position": "0 0, 0 4px, 4px -4px, -4px 0px",
        }}
      />
      <div
        class="absolute inset-0"
        style={{
          background: `linear-gradient(to right, transparent, ${context.color().hex})`,
        }}
      />
      <div
        class={thumbClasses()}
        style={{
          left: `${alpha() * 100}%`,
        }}
      />
    </div>
  );
};

export default AlphaSlider;
