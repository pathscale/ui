import "./ComplexColorWheel.css";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import Button from "../button";
import Card, { type CardMaterial } from "../card";
import Slider from "../slider";
import { ColorWheel, type ColorWheelProps } from "./ColorWheel";

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
  /**
   * Strength, softness and glass axes, in the order the application wants.
   * The composition owns their standard slider markup; colour mathematics
   * remain explicit consumer policy through `preview` and `onChange`.
   */
  adjustments: readonly ColorWheelAdjustment[];
  material?: CardMaterial;
  action?: JSX.Element;
  adjustmentsClass?: string;
}

/**
 * A colour wheel with standard value axes beside it.
 *
 * This is deliberately a composition instead of a theme engine. Applications
 * agree on the interaction and accessible structure while retaining control
 * of what "strength", "softness", blur, refraction or depth mean for their
 * own tokens.
 */
export function ComplexColorWheel(props: ComplexColorWheelProps): JSX.Element {
  return (
    <Card
      material={props.material ?? "glass"}
      class="complex-color-wheel"
      data-slot="complex-color-wheel"
    >
      <ColorWheel
        value={props.value}
        onChange={props.onChange}
        mode={props.mode}
        palette={props.palette}
        isDisabled={props.isDisabled}
        class={props.class}
        wheelClass={props.wheelClass}
        aria-label={props["aria-label"]}
      />

      <div
        class={`complex-color-wheel__adjustments ${props.adjustmentsClass ?? ""}`.trim()}
        data-slot="complex-color-wheel-adjustments"
      >
        <Show when={props.action}>
          <div class="complex-color-wheel__action" data-slot="complex-color-wheel-action">
            {props.action}
          </div>
        </Show>

        <For each={props.adjustments}>
          {(adjustment) => (
            <div
              class="complex-color-wheel__axis"
              data-slot="complex-color-wheel-axis"
              data-axis={adjustment.id}
            >
              <div class="complex-color-wheel__axis-heading">
                <span>{adjustment.label}</span>
                <span>{adjustment.formatValue?.(adjustment.value) ?? adjustment.value}</span>
              </div>
              <div class="complex-color-wheel__axis-control">
                <Show
                  when={adjustment.stops?.length ? adjustment.stops : undefined}
                  fallback={
                    <>
                      <Show when={adjustment.preview}>
                        <span
                          class="complex-color-wheel__preview"
                          aria-hidden="true"
                          style={{
                            "background-color": adjustment.preview?.(
                              adjustment.value,
                              props.value,
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
                        disabled={props.isDisabled}
                        onChange={adjustment.onChange}
                        onChangeEnd={adjustment.onChangeEnd}
                        formatValue={adjustment.formatValue}
                        size="sm"
                      />
                    </>
                  }
                >
                  {(stops) => (
                    <div class="complex-color-wheel__stops">
                      <For each={stops()}>
                        {(stop) => (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={`${adjustment.label} ${
                              adjustment.formatValue?.(stop) ?? stop
                            }`}
                            aria-pressed={
                              Math.abs(adjustment.value - stop) < 0.001 ? "true" : "false"
                            }
                            disabled={props.isDisabled}
                            onClick={() => adjustment.onChange(stop)}
                            class="complex-color-wheel__stop"
                          >
                            <span
                              aria-hidden="true"
                              class="complex-color-wheel__stop-preview"
                              style={{
                                "background-color": adjustment.preview?.(stop, props.value),
                                color: adjustment.ink?.(stop, props.value),
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
                <span class="complex-color-wheel__hint">{adjustment.hint}</span>
              </Show>
            </div>
          )}
        </For>
      </div>
    </Card>
  );
}
