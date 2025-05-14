import {
  createSignal,
  type Component,
  type JSX,
  For,
  Show,
} from "solid-js";
import { stepsContainer, stepItemStyles } from "./Steps.styles";
import { buttonVariants } from "../button/Button.styles";

type StepItem = {
  title: string;
  subtitle?: string;
  marker?: string;
  content: JSX.Element;
  clickable?: boolean;
  class?: string;
};

type StepsProps = {
  animated?: boolean;
  steps: StepItem[];
};

const Steps: Component<StepsProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal(0);

  const next = () => setActiveTab((prev) => Math.min(prev + 1, props.steps.length - 1));
  const back = () => setActiveTab((prev) => Math.max(prev - 1, 0));
  const reset = () => setActiveTab(0);

  return (
    <div class={stepsContainer({ animated: props.animated })}>
      <For each={props.steps}>
        {(step, index) => (
          <Show when={index() === activeTab()}>
            <div
              class={stepItemStyles({ class: step.class })}
              data-step-index={index()}
            >
              <div class="mb-4">
                <h3 class="text-xl font-semibold">{step.title}</h3>
                <Show when={step.subtitle}>
                  <p class="text-sm text-gray-500">{step.subtitle}</p>
                </Show>
              </div>
              {step.content}

              {/* Navigation */}
              <div class="flex justify-end gap-2 mt-6">
                <Show when={index() > 0}>
                  <button class={buttonVariants({ color: "light" })} onClick={back}>
                    Back
                  </button>
                </Show>
                <Show when={index() < props.steps.length - 1}>
                  <button class={buttonVariants({ color: "primary" })} onClick={next}>
                    Next
                  </button>
                </Show>
                <Show when={index() === props.steps.length - 1}>
                  <button class={buttonVariants({ color: "primary" })} onClick={reset}>
                    Restart
                  </button>
                </Show>
              </div>
            </div>
          </Show>
        )}
      </For>
    </div>
  );
};

export default Steps;
