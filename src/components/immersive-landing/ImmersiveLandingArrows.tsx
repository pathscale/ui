import { Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingArrowsProps } from "./types";
import { CLASSES } from "./ImmersiveLanding.classes";

const ImmersiveLandingArrows = (props: ImmersiveLandingArrowsProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "onPrev",
    "onNext",
    "isFirstPage",
    "isLastPage",
    "class",
    "className",
  ]);

  const handleNext = () => {
    if (local.onNext) {
      local.onNext();
    }
  };

  const handlePrev = () => {
    if (local.onPrev) {
      local.onPrev();
    }
  };

  return (
    <>
      {/* Left Arrow - Desktop only */}
      <Show when={!local.isFirstPage}>
        <button
          type="button"
          onClick={handlePrev}
          {...{
            class: twMerge(
              CLASSES.arrows.button,
              CLASSES.arrows.prev,
              local.class,
              local.className,
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </Show>

      {/* Right Arrow - Desktop only */}
      <Show when={!local.isLastPage}>
        <button
          type="button"
          onClick={handleNext}
          {...{
            class: twMerge(
              CLASSES.arrows.button,
              CLASSES.arrows.next,
              local.class,
              local.className,
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </Show>
    </>
  );
};

export default ImmersiveLandingArrows;
