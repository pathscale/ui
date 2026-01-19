import { type JSX, For } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { parseColor } from "./ColorUtils";

export interface ColorSwatchesProps {
  swatches: string[];
  class?: string;
  className?: string;
}

const ColorSwatches = (props: ColorSwatchesProps): JSX.Element => {
  const context = useColorPickerContext();

  const handleSwatchClick = (swatch: string) => {
    if (context.disabled()) return;
    const color = parseColor(swatch);
    if (color) {
      context.onChange(color);
    }
  };

  const handleKeyDown = (e: KeyboardEvent, swatch: string) => {
    if (context.disabled()) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSwatchClick(swatch);
    }
  };

  const classes = () =>
    twMerge(
      "grid grid-cols-8 gap-2 w-full",
      clsx({
        "opacity-50 pointer-events-none": context.disabled(),
      }),
      props.class,
      props.className,
    );

  const swatchClasses = (swatch: string) => {
    const isSelected = context.color().hex.toLowerCase() === swatch.toLowerCase();
    return twMerge(
      "w-8 h-8 rounded cursor-pointer border-2 transition-all duration-150",
      clsx({
        "border-primary ring-2 ring-primary ring-offset-2": isSelected,
        "border-gray-300 hover:scale-110 hover:shadow-lg": !isSelected,
        "dark:border-gray-600": !isSelected,
      }),
    );
  };

  return (
    <div class={classes()}>
      <For each={props.swatches}>
        {(swatch) => (
          <button
            type="button"
            class={swatchClasses(swatch)}
            style={{ "background-color": swatch }}
            onClick={() => handleSwatchClick(swatch)}
            onKeyDown={(e) => handleKeyDown(e, swatch)}
            aria-label={`Select color ${swatch}`}
            disabled={context.disabled()}
            tabIndex={context.disabled() ? -1 : 0}
          />
        )}
      </For>
    </div>
  );
};

export default ColorSwatches;
