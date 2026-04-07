import { type Component, For, createMemo, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import Button from "../button";
import type { IComponentBaseProps } from "../types";
import { createSizeStore, type SizeStore, type SizePreset } from "./sizeStore";

const PRESETS: SizePreset[] = ["M", "L", "XL"];

export interface SizePickerProps extends IComponentBaseProps {
  storagePrefix?: string;
  onSizeChange?: (size: SizePreset) => void;
  "aria-label"?: string;
}

const SizePicker: Component<SizePickerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "storagePrefix",
    "onSizeChange",
    "aria-label",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const store = createMemo<SizeStore>(() =>
    createSizeStore(local.storagePrefix ?? "theme")
  );

  const handleClick = (preset: SizePreset) => {
    store().setSize(preset);
    local.onSizeChange?.(preset);
  };

  const classes = () =>
    twMerge("inline-flex gap-1", clsx(local.class, local.className));

  return (
    <div
      class={classes()}
      style={local.style}
      role="radiogroup"
      aria-label={local["aria-label"] ?? "Change text size"}
      {...others}
    >
      <For each={PRESETS}>
        {(preset) => (
          <Button
            type="button"
            size="sm"
            variant={store().size() === preset ? "primary" : "ghost"}
            onClick={() => handleClick(preset)}
            role="radio"
            aria-checked={store().size() === preset}
            aria-label={`Size ${preset}`}
          >
            {preset}
          </Button>
        )}
      </For>
    </div>
  );
};

export default SizePicker;
