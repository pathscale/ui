import type { JSX } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatColor } from "./ColorUtils";
import type { ColorValue } from "./ColorUtils";

export interface ColorPreviewProps {
  color: ColorValue;
  disabled?: boolean;
  onClick?: () => void;
  class?: string;
  className?: string;
}

const ColorPreview = (props: ColorPreviewProps): JSX.Element => {
  const classes = () =>
    twMerge(
      "w-10 h-10 rounded border-2 cursor-pointer transition-all duration-150 overflow-hidden",
      clsx({
        "border-base-300 hover:scale-110 hover:shadow-lg": !props.disabled,
        "border-base-200 opacity-50 cursor-not-allowed": props.disabled,
      }),
      props.class,
      props.className,
    );

  const hasAlpha = () => props.color.hsl.a < 1;

  return (
    <button
      type="button"
      class={classes()}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={`Current color: ${formatColor(props.color, "hex")}`}
      tabIndex={props.disabled ? -1 : 0}
    >
      {hasAlpha() && (
        <div
          class="absolute inset-0"
          style={{
            "background-image":
              "linear-gradient(45deg, hsl(var(--b3)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--b3)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--b3)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--b3)) 75%)",
            "background-size": "8px 8px",
            "background-position": "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        />
      )}
      <div
        class="w-full h-full relative"
        style={{
          "background-color": `rgba(${props.color.rgb.r}, ${props.color.rgb.g}, ${props.color.rgb.b}, ${props.color.rgb.a})`,
        }}
      />
    </button>
  );
};

export default ColorPreview;
