import clsx from "clsx";
import { splitProps, type JSX, type ParentProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import CarouselItem from "./CarouselItem";

export type CarouselProps = JSX.HTMLAttributes<HTMLDivElement> & {
	snap?: "start" | "center" | "end";
	direction?: "horizontal" | "vertical";
};

const Carousel = (props: ParentProps<CarouselProps>) => {
	const [local, rest] = splitProps(props, [
		"class",
		"children",
		"snap",
		"direction",
	]);

	const classes = twMerge(
		"carousel",
		local.class,
		clsx({
			"carousel-start": local.snap === "start" || !local.snap,
			"carousel-center": local.snap === "center",
			"carousel-end": local.snap === "end",
			"carousel-vertical": local.direction === "vertical",
			"carousel-horizontal": local.direction === "horizontal",
		})
	);

	return (
		<div {...rest} class={classes}>
			{local.children}
		</div>
	);
};

export default Object.assign(Carousel, {
	Item: CarouselItem,
}); 