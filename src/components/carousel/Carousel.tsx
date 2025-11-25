import clsx from "clsx";
import { splitProps, type JSX, type ParentProps, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";

import CarouselItem from "./CarouselItem";

export type CarouselProps = JSX.HTMLAttributes<HTMLDivElement> & {
  snap?: "start" | "center" | "end";
  direction?: "horizontal" | "vertical";
  "aria-label"?: string;
  "aria-roledescription"?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-live"?: "off" | "polite";
  "aria-atomic"?: boolean;
};

const Carousel = (props: ParentProps<CarouselProps>) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "snap",
    "direction",
    "aria-label",
    "aria-roledescription",
    "aria-describedby",
    "aria-labelledby",
    "aria-live",
    "aria-atomic",
  ]);

  const classes = createMemo(() =>
    twMerge(
      "carousel",
      local.class,
      clsx({
        "carousel-start": local.snap === "start" || !local.snap,
        "carousel-center": local.snap === "center",
        "carousel-end": local.snap === "end",
        "carousel-vertical": local.direction === "vertical",
        "carousel-horizontal": local.direction === "horizontal",
      }),
    ),
  );

  const ariaRoleDescription = createMemo(
    () => local["aria-roledescription"] || "carousel",
  );
  const ariaLabel = createMemo(() => local["aria-label"]);
  const ariaDescribedby = createMemo(() => local["aria-describedby"]);
  const ariaLabelledby = createMemo(() => local["aria-labelledby"]);
  const ariaLive = createMemo(() => local["aria-live"] || "polite");
  const ariaAtomic = createMemo(() => local["aria-atomic"] || false);

  return (
    <div
      {...rest}
      class={classes()}
      role="region"
      aria-roledescription={ariaRoleDescription()}
      aria-label={ariaLabel()}
      aria-describedby={ariaDescribedby()}
      aria-labelledby={ariaLabelledby()}
    >
      <div
        class="carousel-content"
        aria-live={ariaLive()}
        aria-atomic={ariaAtomic()}
      >
        {local.children}
      </div>
    </div>
  );
};

export default Object.assign(Carousel, {
  Item: CarouselItem,
});
