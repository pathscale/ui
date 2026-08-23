import "./ComplexColorWheel.css";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import Button from "../button";
import Card, { type CardMaterial } from "../card";
import Slider from "../slider";
import {
  ColorWheelLayout as ColorWheel,
  type ColorWheelProps,
} from "./ColorWheel.generated";
import { complexColorWheel } from "./ComplexColorWheel.recipe";

export interface ColorWheelAdjustment {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** Curated values rendered as semantic choices instead of a continuous slider. */
  stops?: readonly number[];
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  formatValue?: (value: number) => string;
  /** Optional literal preview produced by this adjustment at a value. */
  preview?: (value: number, color: string) => string;
  /** Optional foreground preview, such as a text-brightness sample. */
  ink?: (value: number, color: string) => string;
}

export interface ComplexColorWheelProps extends ColorWheelProps {
  /** Standard value axes rendered beside the wheel. */
  adjustments: readonly ColorWheelAdjustment[];
  material?: CardMaterial;
  action?: JSX.Element;
  adjustmentsClass?: string;
}

/** A colour wheel with standard value axes beside it. */
export const ComplexColorWheelLayout: Layout<
  typeof complexColorWheel,
  ComplexColorWheelProps
> = () => (
  <Card
    {...slot.root}
    material={local.material ?? "glass"}
  >
    <ColorWheel
      value={local.value}
      onChange={local.onChange}
      mode={local.mode}
      palette={local.palette}
      isDisabled={local.isDisabled}
      class={local.class}
      wheelClass={local.wheelClass}
      aria-label={local["aria-label"]}
    />

    <div
      {...slot.adjustments}
      class={twMerge(slot.adjustments.class, local.adjustmentsClass)}
    >
      <Show when={local.action}>
        <div {...slot.action}>{local.action}</div>
      </Show>

      <For each={local.adjustments}>
        {(adjustment) => (
          <div
            {...slot.axis}
            data-axis={adjustment.id}
          >
            <div {...slot.axisHeading}>
              <span>{adjustment.label}</span>
              <span>
                {adjustment.formatValue?.(adjustment.value) ?? adjustment.value}
              </span>
            </div>
            <div {...slot.axisControl}>
              <Show
                when={adjustment.stops?.length ? adjustment.stops : undefined}
                fallback={
                  <>
                    <Show when={adjustment.preview}>
                      <span
                        {...slot.preview}
                        aria-hidden="true"
                        style={{
                          "background-color": adjustment.preview?.(
                            adjustment.value,
                            local.value,
                          ),
                        }}
                      />
                    </Show>
                    <Slider
                      label={adjustment.label}
                      value={adjustment.value}
                      min={adjustment.min ?? 0}
                      max={adjustment.max ?? 100}
                      step={adjustment.step}
                      disabled={local.isDisabled}
                      onChange={adjustment.onChange}
                      onChangeEnd={adjustment.onChangeEnd}
                      formatValue={adjustment.formatValue}
                      size="sm"
                    />
                  </>
                }
              >
                {(stops) => (
                  <div {...slot.stops}>
                    <For each={stops()}>
                      {(stop) => (
                        <Button
                          {...slot.stop}
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`${adjustment.label} ${
                            adjustment.formatValue?.(stop) ?? stop
                          }`}
                          aria-pressed={
                            Math.abs(adjustment.value - stop) < 0.001
                              ? "true"
                              : "false"
                          }
                          disabled={local.isDisabled}
                          onClick={() => adjustment.onChange(stop)}
                        >
                          <span
                            {...slot.stopPreview}
                            aria-hidden="true"
                            style={{
                              "background-color": adjustment.preview?.(
                                stop,
                                local.value,
                              ),
                              color: adjustment.ink?.(stop, local.value),
                            }}
                          >
                            <Show when={adjustment.ink}>A</Show>
                          </span>
                        </Button>
                      )}
                    </For>
                  </div>
                )}
              </Show>
            </div>
            <Show when={adjustment.hint}>
              <span {...slot.hint}>{adjustment.hint}</span>
            </Show>
          </div>
        )}
      </For>
    </div>
  </Card>
);
