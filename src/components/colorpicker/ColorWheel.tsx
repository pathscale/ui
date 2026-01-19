import { type JSX, createSignal, onMount, onCleanup } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { createColorFromHsl } from "./ColorUtils";

export interface ColorWheelProps {
  class?: string;
  className?: string;
}

const ColorWheel = (props: ColorWheelProps): JSX.Element => {
  const context = useColorPickerContext();
  const [isDragging, setIsDragging] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;
  let cursorRef: HTMLDivElement | undefined;

  const hue = () => context.color().hsl.h;
  const saturation = () => context.color().hsl.s;
  const lightness = () => context.color().hsl.l;

  const updateColor = (x: number, y: number) => {
    if (!containerRef || context.disabled()) return;

    const rect = containerRef.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate vector from center
    const dx = x - rect.left - centerX;
    const dy = y - rect.top - centerY;

    // Calculate angle (hue)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    // Calculate distance (saturation)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = rect.width / 2;
    const s = Math.min(100, (distance / radius) * 100);

    const newColor = createColorFromHsl(
      Math.round(angle),
      Math.round(s),
      lightness(),
      context.color().hsl.a
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
      "relative w-48 h-48 rounded-full cursor-crosshair select-none overflow-hidden mx-auto",
      clsx({
        "opacity-50 cursor-not-allowed": context.disabled(),
      }),
      props.class,
      props.className
    );

  const cursorPosition = () => {
    const hRad = (hue() - 90) * (Math.PI / 180);
    const sNorm = saturation() / 100;

    const x = 50 + 50 * sNorm * Math.cos(hRad);
    const y = 50 + 50 * sNorm * Math.sin(hRad);

    return { x, y };
  };

  const cursorClasses = () =>
    twMerge(
      "absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2",
      clsx({
        "ring-2 ring-primary": isDragging(),
      })
    );

  return (
    <div
      ref={containerRef}
      class={classes()}
      style={{
        background: `
          radial-gradient(circle, white 0%, transparent 100%),
          conic-gradient(
            from 0deg,
            hsl(0, 100%, 50%),
            hsl(60, 100%, 50%),
            hsl(120, 100%, 50%),
            hsl(180, 100%, 50%),
            hsl(240, 100%, 50%),
            hsl(300, 100%, 50%),
            hsl(360, 100%, 50%)
          )
        `,
      }}
      onMouseDown={handleMouseDown}
      tabIndex={context.disabled() ? -1 : 0}
      role="slider"
      aria-label="Color Wheel"
      aria-valuetext={`Hue ${Math.round(hue())}deg, Saturation ${Math.round(
        saturation()
      )}%`}
      aria-disabled={context.disabled()}
    >
      <div
        ref={cursorRef}
        class={cursorClasses()}
        style={{
          left: `${cursorPosition().x}%`,
          top: `${cursorPosition().y}%`,
          "background-color": `hsl(${hue()}, ${saturation()}%, 50%)`,
        }}
      />
    </div>
  );
};

export default ColorWheel;
