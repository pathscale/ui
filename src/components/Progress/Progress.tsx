import {
  type Component,
  splitProps,
  Show,
  createMemo,
  type ComponentProps,
} from "solid-js";
import { classes } from "@src/lib/style";
import type { VariantProps } from "@src/lib/style";
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
    Omit<ComponentProps<"div">, "class" | "color"> {
  value?: number | null;
  showValue?: boolean;
  format?: "percent" | "raw";
  className?: string;
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
    "className",
  ] as const);

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
      class={classes(progressContainer({ size: local.size }), local.className)}
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
            class={progressFill({
              color: local.color,
              variant: local.variant,
            })}
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
