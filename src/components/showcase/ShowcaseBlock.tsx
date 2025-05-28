import { ParentComponent, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export interface ShowcaseBlockProps extends IComponentBaseProps {
	title: string;
	description?: string;
	code?: string;
	preview?: boolean;
}

const ShowcaseBlock: ParentComponent<ShowcaseBlockProps> = (props) => {
	const [local, others] = splitProps(props, [
		"title",
		"description",
		"code",
		"preview",
		"children",
		"class",
		"className",
		"dataTheme"
	]);

	return (
		<div
			{...others}
			data-theme={local.dataTheme}
			class={twMerge("space-y-4", local.class, local.className)}
		>
			<div class="p-6 bg-base-200 rounded-lg shadow-sm">
				<h3 class="text-xl font-semibold mb-2 text-base-content">
					{local.title}
				</h3>
				<Show when={local.description}>
					<p class="text-base-content/70 mb-4">{local.description}</p>
				</Show>
				<div
					class={
						local.preview
							? "p-8 border border-base-content/15 rounded-lg bg-base-100"
							: ""
					}
				>
					{local.children}
				</div>
			</div>
		</div>
	);
};

export default ShowcaseBlock; 