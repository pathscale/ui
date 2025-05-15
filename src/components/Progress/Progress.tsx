import {
  type Component,
  splitProps,
  Show,
  createMemo,
  type ComponentProps,
} from "solid-js";
import { classes } from "@src/lib/style";
import type { VariantProps, ClassProps } from "@src/lib/style";
import {
  progressContainer,
  progressWrapper,
  progressFill,
  progressLabel,
} from "./Progress.styles";

export interface ProgressProps
  extends VariantProps<typeof progressContainer>,
    VariantProps<typeof progressWrapper>,
    VariantProps<typeof progressFill>,
    ClassProps,
    ComponentProps<"div"> {
  /** 0–100 for determinate, null for indeterminate */
  value?: number | null;
  /** Show the numeric label */
  showValue?: boolean;
  /** percent (e.g. “70%”) or raw (“70”) */
  format?: "percent" | "raw";
}

const Progress: Component<ProgressProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "value",
    "size",
    "shape",
    "variant",
    "color",
    "showValue",
    "format",
    "class",
    "className",
  ] as const);

  // Ensure a number or null
  const val = createMemo(() =>
    typeof local.value === "number"
      ? Math.max(0, Math.min(100, local.value))
      : null
  );
  const isDeterminate = () => val() !== null;

  const labelText = createMemo(() => {
    if (!local.showValue || val() == null) return "";
    return local.format === "percent" ? `${val()}%` : String(val());
  });

  return (
    <div
      {...rest}
      class={classes(
        progressContainer({ size: local.size }),
        local.class,
        local.className
      )}
      aria-busy={!isDeterminate()}
    >
      <div
        class={classes(
          progressWrapper({ size: local.size, shape: local.shape })
        )}
      >
        <Show
          when={isDeterminate()}
          fallback={
            <div
              class={classes(
                progressFill({ color: local.color, variant: local.variant }),
                "animate-pulse"
              )}
              style={{ width: "100%" }}
            />
          }
        >
          <div
            class={progressFill({ color: local.color, variant: local.variant })}
            style={{ width: `${val()}%` }}
          />
        </Show>
      </div>

      <Show when={local.showValue && labelText()}>
        <div class={progressLabel()}>{labelText()}</div>
      </Show>
    </div>
  );
};

export default Progress;