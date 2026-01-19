import { type JSX, createSignal, createEffect } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import type { ColorFormat } from "./ColorUtils";
import { parseColor, formatColor } from "./ColorUtils";

export interface ColorInputProps {
  class?: string;
  className?: string;
}

const ColorInput = (props: ColorInputProps): JSX.Element => {
  const context = useColorPickerContext();
  const [inputValue, setInputValue] = createSignal("");
  const [isValid, setIsValid] = createSignal(true);

  createEffect(() => {
    const formatted = formatColor(context.color(), context.format());
    setInputValue(formatted);
    setIsValid(true);
  });

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    setInputValue(value);

    const parsed = parseColor(value);
    if (parsed) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      applyColor();
    }
  };

  const handleBlur = () => {
    applyColor();
  };

  const applyColor = () => {
    const parsed = parseColor(inputValue());
    if (parsed) {
      context.onChange(parsed);
      setIsValid(true);
    } else {
      // Reset to current color if invalid
      const formatted = formatColor(context.color(), context.format());
      setInputValue(formatted);
      setIsValid(true);
    }
  };

  const handleFormatChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newFormat = target.value as ColorFormat;
    context.onFormatChange(newFormat);
  };

  const inputClasses = () =>
    twMerge(
      "flex-1 px-3 py-2 text-sm border rounded-l focus:outline-none focus:ring-2 focus:ring-primary",
      clsx({
        "border-error focus:ring-error": !isValid(),
        "border-base-300": isValid(),
        "bg-base-200 cursor-not-allowed": context.disabled(),
        "bg-base-100 text-base-content": !context.disabled(),
      }),
    );

  const selectClasses = () =>
    twMerge(
      "px-3 py-2 text-sm border border-l-0 rounded-r focus:outline-none focus:ring-2 focus:ring-primary bg-base-100 text-base-content border-base-300",
      clsx({
        "bg-base-200 cursor-not-allowed": context.disabled(),
      }),
    );

  return (
    <div class={twMerge("flex w-full", props.class, props.className)}>
      <input
        type="text"
        value={inputValue()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={context.disabled()}
        class={inputClasses()}
        aria-label="Color value"
        aria-invalid={!isValid()}
      />
      <select
        value={context.format()}
        onChange={handleFormatChange}
        disabled={context.disabled()}
        class={selectClasses()}
        aria-label="Color format"
      >
        <option value="hex">HEX</option>
        <option value="rgb">RGB</option>
        <option value="rgba">RGBA</option>
        <option value="hsl">HSL</option>
        <option value="hsla">HSLA</option>
      </select>
    </div>
  );
};

export default ColorInput;
