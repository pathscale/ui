import { splitProps, type JSX, type ParentProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export type CarouselItemProps = JSX.HTMLAttributes<HTMLDivElement> & {
  "aria-current"?:
    | boolean
    | "true"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
};

const CarouselItem = (props: ParentProps<CarouselItemProps>) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "aria-current",
  ]);

  const classes = twMerge("carousel-item", local.class);

  return (
    <div
      {...rest}
      class={classes}
      role="group"
      aria-roledescription="slide"
      aria-current={local["aria-current"]}
    >
      {local.children}
    </div>
  );
};

export default CarouselItem;
