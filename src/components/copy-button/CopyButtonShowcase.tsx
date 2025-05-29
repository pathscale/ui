import type { Component } from "solid-js";
import CopyButton from "./CopyButton";

const CopyButtonShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">
					Copy Button
				</h2>
				<CopyButton text="Hello, world!" />
			</section>
		</div>
	);
};

export default CopyButtonShowcase;
