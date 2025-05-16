// components/Steps.tsx
import {
  type Component,
  createSignal,
  splitProps,
  For,
  Show,
  createMemo,
  type JSX,
} from "solid-js";
import {
  stepsContainer,
  navBar,
  navItem,
  marker,
  line,
  title,
  subtitle,
  buttonSteps,
} from "./Steps.styles";
import { classes, type VariantProps } from "@src/lib/style";

export type StepItem = {
  title: string;
  marker?: string;
  subtitle?: string;
  clickable?: boolean;
  content: JSX.Element;
  className?: string;
};

export type StepsProps = {
  steps: StepItem[];
  animated?: boolean;
  initial?: number;
  /** Controlled active index */
  value?: number;
  /** Fired on step change */
  onStepChange?: (stepIndex: number) => void;
  className?: string;
} & VariantProps<typeof stepsContainer>;

const Steps: Component<StepsProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["steps", "animated", "initial", "value", "onStepChange", "className"] as const,
    ["animated"] as const
  );

  const isControlled = () => local.value !== undefined;
  const [internalIndex, setInternalIndex] = createSignal(local.initial ?? 0);
  const activeIndex = createMemo(() =>
    isControlled() ? (local.value as number) : internalIndex()
  );

  const clamp = (i: number) => Math.max(0, Math.min(i, local.steps.length - 1));

  const changeIndex = (i: number) => {
    const idx = clamp(i);
    if (isControlled()) local.onStepChange?.(idx);
    else setInternalIndex(idx);
  };

  const next = () => changeIndex(activeIndex() + 1);
  const back = () => changeIndex(activeIndex() - 1);

  const isActive = (i: number) => i === activeIndex();
  const isPast = (i: number) => i < activeIndex();

  return (
    <div
      class={classes(
        stepsContainer({ animated: local.animated }),
        local.className
      )}
      {...otherProps}
    >
      <nav class={navBar()}>
        <For each={local.steps}>
          {(step, idx) => {
            const i = idx();
            return (
              <div
                class={navItem({ clickable: !!step.clickable })}
                onClick={() => step.clickable && changeIndex(i)}
              >
                <div class={marker({ active: isActive(i) || isPast(i) })}>
                  {step.marker ?? String(i + 1)}
                </div>
                <Show when={i < local.steps.length - 1}>
                  <div class={line({ active: isPast(i) })} />
                </Show>
                <div class={title({ active: isActive(i) || isPast(i) })}>
                  {step.title}
                </div>
                <Show when={step.subtitle}>
                  <div class={subtitle()}>{step.subtitle}</div>
                </Show>
              </div>
            );
          }}
        </For>
      </nav>
      <div>
        <For each={local.steps}>
          {(step, idx) => {
            const i = idx();
            return (
              <Show when={isActive(i)}>
                <div>
                  {step.content}
                  <div class="flex justify-end gap-2 mt-6">
                    <Show when={i > 0}>
                      <button
                        type="button"
                        class="px-4 py-2 border rounded"
                        onClick={back}
                      >
                        Back
                      </button>
                    </Show>
                    <Show when={i < local.steps.length - 1}>
                      <button
                        type="button"
                        class={buttonSteps()}
                        onClick={next}
                      >
                        Next
                      </button>
                    </Show>
                    <Show when={i === local.steps.length - 1}>
                      <button
                        type="button"
                        class="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={() => changeIndex(0)}
                      >
                        Restart
                      </button>
                    </Show>
                  </div>
                </div>
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default Steps;
