import { ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { HeroContent } from "./HeroContent";
import { HeroOverlay } from "./HeroOverlay";

export type HeroProps = IComponentBaseProps & {
	minHeight?: string;
};

const Hero: ParentComponent<HeroProps> = (props) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"className",
		"dataTheme",
		"minHeight",
		"style"
	]);

	const classes = () =>
		twMerge(
			"hero",
			local.class,
			local.className
		);

	const heroStyle = () => {
		const baseStyle = local.style || {};
		return {
			...baseStyle,
			minHeight: local.minHeight || undefined,
		};
	};

	return (
		<div
			{...others}
			data-theme={local.dataTheme}
			class={classes()}
			style={heroStyle()}
		>
			{local.children}
		</div>
	);
};

const HeroNamespaces = Object.assign(Hero, {
	Content: HeroContent,
	Overlay: HeroOverlay
});

export default HeroNamespaces;