import { type JSX, createSignal, For } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { rgbToHsl, createColorFromHsl } from "./ColorUtils";

export interface ColorWheelFlowerProps {
  class?: string;
  className?: string;
}

type ColorItem = {
  rgb: string;
  transform: string;
  hue: number;
  saturation: number;
  lightness: number;
};


const parseRgbToHsl = (rgbString: string) => {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return { hue: 0, saturation: 0, lightness: 100 };
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  const hsl = rgbToHsl(r, g, b);
  return { hue: hsl.h, saturation: hsl.s, lightness: hsl.l };
};


const COLORS: ColorItem[] = [
  { rgb: "rgb(245,245,61)", transform: "translateX(34.641px) translateY(-20px)", ...parseRgbToHsl("rgb(245,245,61)") },
  { rgb: "rgb(245,153,61)", transform: "translateX(20px) translateY(-34.641px)", ...parseRgbToHsl("rgb(245,153,61)") },
  { rgb: "rgb(245,61,61)", transform: "translateY(-40px)", ...parseRgbToHsl("rgb(245,61,61)") },
  { rgb: "rgb(245,61,153)", transform: "translateX(-20px) translateY(-34.641px)", ...parseRgbToHsl("rgb(245,61,153)") },
  { rgb: "rgb(245,61,245)", transform: "translateX(-34.641px) translateY(-20px)", ...parseRgbToHsl("rgb(245,61,245)") },
  { rgb: "rgb(153,61,245)", transform: "translateX(-40px)", ...parseRgbToHsl("rgb(153,61,245)") },
  { rgb: "rgb(61,61,245)", transform: "translateX(-34.641px) translateY(20px)", ...parseRgbToHsl("rgb(61,61,245)") },
  { rgb: "rgb(61,153,245)", transform: "translateX(-20px) translateY(34.641px)", ...parseRgbToHsl("rgb(61,153,245)") },
  { rgb: "rgb(61,245,245)", transform: "translateY(40px)", ...parseRgbToHsl("rgb(61,245,245)") },
  { rgb: "rgb(61,245,153)", transform: "translateX(20px) translateY(34.641px)", ...parseRgbToHsl("rgb(61,245,153)") },
  { rgb: "rgb(61,245,61)", transform: "translateX(34.641px) translateY(20px)", ...parseRgbToHsl("rgb(61,245,61)") },
  { rgb: "rgb(153,245,61)", transform: "translateX(40px)", ...parseRgbToHsl("rgb(153,245,61)") },
  { rgb: "rgb(240,217,194)", transform: "translateX(10px) translateY(-17.3205px)", ...parseRgbToHsl("rgb(240,217,194)") },
  { rgb: "rgb(240,194,217)", transform: "translateX(-10px) translateY(-17.3205px)", ...parseRgbToHsl("rgb(240,194,217)") },
  { rgb: "rgb(217,194,240)", transform: "translateX(-20px)", ...parseRgbToHsl("rgb(217,194,240)") },
  { rgb: "rgb(194,217,240)", transform: "translateX(-10px) translateY(17.3205px)", ...parseRgbToHsl("rgb(194,217,240)") },
  { rgb: "rgb(194,240,217)", transform: "translateX(10px) translateY(17.3205px)", ...parseRgbToHsl("rgb(194,240,217)") },
  { rgb: "rgb(217,240,194)", transform: "translateX(20px)", ...parseRgbToHsl("rgb(217,240,194)") },
  { rgb: "rgb(255,255,255)", transform: "none", ...parseRgbToHsl("rgb(255,255,255)") },
];


const RAINBOW_GRADIENT = `conic-gradient(
  from 0deg,
  rgb(245,61,61) 0deg,
  rgb(245,153,61) 30deg,
  rgb(245,245,61) 60deg,
  rgb(61,245,61) 120deg,
  rgb(61,245,245) 180deg,
  rgb(61,61,245) 240deg,
  rgb(245,61,245) 300deg,
  rgb(245,61,61) 360deg
)`;

const ColorWheelFlower = (props: ColorWheelFlowerProps): JSX.Element => {
  const context = useColorPickerContext();
  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);


  const handleDotClick = (index: number) => {
    if (context.disabled()) return;
    
    if (selectedIndex() === index) {
      setSelectedIndex(null);
      const whiteColor = createColorFromHsl(0, 0, 100, context.color().hsl.a);
      context.onChange(whiteColor);
    } else {
      setSelectedIndex(index);
      const color = COLORS[index];
      
      const newColor = createColorFromHsl(
        color.hue,
        color.saturation,
        color.lightness,
        context.color().hsl.a
      );
      context.onChange(newColor);
    }
  };


  const handleDotHover = (el: HTMLElement, isEntering: boolean) => {
 
  };

  const containerClasses = () =>
    twMerge(
      "relative w-[140px] h-[140px] flex items-center justify-center",
      clsx({
        "opacity-50 cursor-not-allowed": context.disabled(),
      }),
      props.class,
      props.className
    );


  const outerRingBackground = () => {
    const idx = selectedIndex();
    return idx === null 
      ? RAINBOW_GRADIENT 
      : `conic-gradient(${COLORS[idx].rgb}, ${COLORS[idx].rgb})`;
  };

  return (
    <div class={containerClasses()}>
      <div class="absolute inset-0">
        <div
          class="absolute inset-0 rounded-full transition-all duration-500 ease-out"
          style={{
            background: outerRingBackground(),
            transform: "scale(1.1)",
          }}
        />
        <div 
          class="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: "#0b1012",
            transform: "scale(0.9)",
          }}
        />
      </div>

      <div class="relative z-10 w-[calc(100%-5px)] h-[calc(100%-5px)] rounded-full">
        <For each={COLORS}>
          {(item, index) => {
            let buttonRef: HTMLButtonElement | undefined;

            return (
              <button
                ref={(el) => {
                  buttonRef = el;
                  el.dataset.baseTransform = item.transform === "none" ? "" : item.transform;
                }}
                type="button"
                tabindex={context.disabled() ? -1 : 0}
                class={clsx(
                  "absolute top-1/2 left-1/2",
                  "w-[32px] h-[32px]",
                  "rounded-full",
                  "-translate-x-1/2 -translate-y-1/2",
                  "transition-shadow duration-200 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-white/50",
                  "z-10",
                  {
                    "cursor-not-allowed": context.disabled(),
                    "cursor-pointer": !context.disabled(),
                  }
                )}
                style={{
                  background: item.rgb,
                  transform: item.transform,
                  "box-shadow": "0 2px 8px rgba(0,0,0,0.3)",
                }}
                onClick={() => handleDotClick(index())}
                onMouseEnter={() => {
                  if (!context.disabled() && buttonRef) {
                    setHoveredIndex(index());
                    handleDotHover(buttonRef, true);
                  }
                }}
                onMouseLeave={() => {
                  if (!context.disabled() && buttonRef) {
                    setHoveredIndex(null);
                    handleDotHover(buttonRef, false);
                  }
                }}
                aria-label={`Select color ${item.rgb}`}
                aria-pressed={selectedIndex() === index()}
              >
                <span
                  class={clsx(
                    "absolute inset-0 rounded-full border-2 border-white",
                    "transition-opacity duration-300 ease-out"
                  )}
                  style={{
                    "mix-blend-mode": "overlay",
                    opacity: selectedIndex() === index() ? "1" : "0",
                  }}
                />
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default ColorWheelFlower;
