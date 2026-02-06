import { Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingArrowsProps } from "./types";

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
    console.log("ImmersiveLandingArrows: handleNext called, onNext is:", typeof local.onNext);
    if (local.onNext) {
      local.onNext();
    }
  };

  const handlePrev = () => {
    console.log("ImmersiveLandingArrows: handlePrev called, onPrev is:", typeof local.onPrev);
    if (local.onPrev) {
      local.onPrev();
    }
  };

  const buttonClasses =
    "fixed top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center justify-center min-w-[48px] min-h-[48px] rounded-full bg-base-content/10 hover:bg-base-content/20 transition-colors cursor-pointer";

  return (
    <>
      {/* Left Arrow - Desktop only */}
      <Show when={!local.isFirstPage}>
        <button
          type="button"
          onClick={handlePrev}
          class={twMerge(buttonClasses, "left-4", local.class, local.className)}
          aria-label="Previous page"
          {...others}
        >
          <svg
            class="w-6 h-6 text-base-content/70"
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
          class={twMerge(buttonClasses, "right-4", local.class, local.className)}
          aria-label="Next page"
          {...others}
        >
          <svg
            class="w-6 h-6 text-base-content/70"
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
