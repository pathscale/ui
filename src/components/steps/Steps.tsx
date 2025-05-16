import {
  type Component,
  createSignal,
  splitProps,
  For,
  Show,
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
} from "./Steps.styles";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";

export type StepItem = {
  title: string;
  marker?: string;
  subtitle?: string;
  /** clicking the circle lets you jump to that step */
  clickable?: boolean;
  /** render this JSX when active */
  content: JSX.Element;
  className?: string;
};

export type StepsProps = {
  steps: StepItem[];
  animated?: boolean;
  /** which step to start on */
  initial?: number;
  className?: string;
} & VariantProps<typeof stepsContainer>
  & ClassProps;

const Steps: Component<StepsProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["steps", "animated", "initial", "class", "className"] as const,
    ["animated"] as const
  );

  // Internal active index, starting at `initial` or 0
  const [activeIndex, setActiveIndex] = createSignal(
    local.initial ?? 0
  );

  // clamp helper
  const clamp = (i: number) =>
    Math.max(0, Math.min(i, local.steps.length - 1));

  // next/back handlers
  const next = () => setActiveIndex((i) => clamp(i + 1));
  const back = () => setActiveIndex((i) => clamp(i - 1));

  // expose the entire step array and active value
  const isActive = (i: number) => i === activeIndex();
  const isPast   = (i: number) => i < activeIndex();

  return (
    <div
      class={classes(
        stepsContainer({ animated: !!variantProps.animated }),
        local.class,
        local.className
      )}
      {...otherProps}
    >
      {/* Navigation */}
      <nav class={navBar()}>
        <For each={local.steps}>
          {(step, idx) => {
            const i = idx();
            return (
              <div
                class={navItem({ clickable: !!step.clickable })}
                onClick={() => step.clickable && setActiveIndex(i)}
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

      {/* Content & Controls */}
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
                        class="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={next}
                      >
                        Next
                      </button>
                    </Show>
                    <Show when={i === local.steps.length - 1}>
                      <button
                        type="button"
                        class="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={() => setActiveIndex(0)}
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
