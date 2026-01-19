import { type JSX, Show, createSignal, onMount, onCleanup } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { createColorFromHsl } from "./ColorUtils";

export interface SaturationBrightnessProps {
  class?: string;
  className?: string;
}

const SaturationBrightness = (
  props: SaturationBrightnessProps,
): JSX.Element => {
  const context = useColorPickerContext();
  const [isDragging, setIsDragging] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;
  let cursorRef: HTMLDivElement | undefined;

  const saturation = () => context.color().hsl.s;
  const brightness = () => 100 - context.color().hsl.l;

  const updateColor = (x: number, y: number) => {
    if (!containerRef || context.disabled()) return;

    const rect = containerRef.getBoundingClientRect();
    const s = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    const l = Math.max(
      0,
      Math.min(100, 100 - ((y - rect.top) / rect.height) * 100),
    );

    const newColor = createColorFromHsl(
      context.color().hsl.h,
      s,
      l,
      context.color().hsl.a,
    );
    context.onChange(newColor);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (context.disabled()) return;
    setIsDragging(true);
    updateColor(e.clientX, e.clientY);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      updateColor(e.clientX, e.clientY);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (context.disabled()) return;

    const step = e.shiftKey ? 10 : 1;
    let s = saturation();
    let l = 100 - brightness();

    switch (e.key) {
      case "ArrowLeft":
        s = Math.max(0, s - step);
        e.preventDefault();
        break;
      case "ArrowRight":
        s = Math.min(100, s + step);
        e.preventDefault();
        break;
      case "ArrowUp":
        l = Math.min(100, l + step);
        e.preventDefault();
        break;
      case "ArrowDown":
        l = Math.max(0, l - step);
        e.preventDefault();
        break;
      default:
        return;
    }

    const newColor = createColorFromHsl(
      context.color().hsl.h,
      s,
      l,
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
      "relative w-full h-48 rounded cursor-crosshair select-none",
      clsx({
        "opacity-50 cursor-not-allowed": context.disabled(),
      }),
      props.class,
      props.className,
    );

  const cursorClasses = () =>
    twMerge(
      "absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2",
      clsx({
        "ring-2 ring-primary": isDragging(),
      }),
    );

  return (
    <div
      ref={containerRef}
      class={classes()}
      style={{
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, hsl(${context.color().hsl.h}, 100%, 50%))
        `,
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={context.disabled() ? -1 : 0}
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={saturation()}
      aria-disabled={context.disabled()}
    >
      <div
        ref={cursorRef}
        class={cursorClasses()}
        style={{
          left: `${saturation()}%`,
          top: `${brightness()}%`,
        }}
      />
    </div>
  );
};

export default SaturationBrightness;
