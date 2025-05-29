import clsx from "clsx";
import { ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type HeroContentProps = IComponentBaseProps & {
	center?: boolean;
};

export const HeroContent: ParentComponent<HeroContentProps> = (props) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"className",
		"dataTheme",
		"center"
	]);

	const classes = () =>
		twMerge(
			"hero-content",
			local.class,
			local.className,
			clsx({
				"text-center": local.center
			})
		);

	return (
		<div {...others} data-theme={local.dataTheme} class={classes()}>
			{local.children}
		</div>
	);
};