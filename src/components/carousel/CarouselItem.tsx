import { splitProps, type JSX, type ParentProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export type CarouselItemProps = JSX.HTMLAttributes<HTMLDivElement>;

const CarouselItem = (props: ParentProps<CarouselItemProps>) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	const classes = twMerge("carousel-item", local.class);

	return (
		<div {...rest} class={classes}>
			{local.children}
		</div>
	);
};

export default CarouselItem; 