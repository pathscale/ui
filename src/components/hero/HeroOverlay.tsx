import { ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type HeroOverlayProps = IComponentBaseProps & {
	bgOpacity?: string;
};

export const HeroOverlay: ParentComponent<HeroOverlayProps> = (props) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"className",
		"dataTheme",
		"bgOpacity",
		"style"
	]);

	const classes = () =>
		twMerge(
			"hero-overlay",
			local.class,
			local.className
		);

	const overlayStyle = () => {
		const baseStyle = local.style || {};
		return {
			...baseStyle,
			backgroundColor: local.bgOpacity ? `rgba(0, 0, 0, ${local.bgOpacity})` : undefined,
		};
	};

	return (
		<div
			{...others}
			data-theme={local.dataTheme}
			class={classes()}
			style={overlayStyle()}
		>
			{local.children}
		</div>
	);
};