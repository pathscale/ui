import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import { CLASSES, type componentRecipe } from "./ImmersiveLanding.recipe";
import type { ImmersiveLandingArrowsProps } from "./types";

const ImmersiveLandingArrows: Layout<
  typeof componentRecipe,
  ImmersiveLandingArrowsProps
> = () => {
  const others = omit(
    props,
    "onPrev",
    "onNext",
    "isFirstPage",
    "isLastPage",
    "class",
  );

  const handleNext = () => {
    if (props.onNext) {
      props.onNext();
    }
  };

  const handlePrev = () => {
    if (props.onPrev) {
      props.onPrev();
    }
  };

  return (
    <>
      {/* Left Arrow - Desktop only */}
      <Show when={!props.isFirstPage}>
        <button
          type="button"
          onClick={handlePrev}
          {...{
            class: twMerge(
              CLASSES.arrows.button,
              CLASSES.arrows.prev,
              props.class,
            ),
          }}
          aria-label="Previous page"
          {...others}
        >
          <svg
            {...{ class: CLASSES.arrows.icon }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </Show>

      {/* Right Arrow - Desktop only */}
      <Show when={!props.isLastPage}>
        <button
          type="button"
          onClick={handleNext}
          {...{
            class: twMerge(
              CLASSES.arrows.button,
              CLASSES.arrows.next,
              props.class,
            ),
          }}
          aria-label="Next page"
          {...others}
        >
          <svg
            {...{ class: CLASSES.arrows.icon }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </Show>
    </>
  );
};

export default ImmersiveLandingArrows;
