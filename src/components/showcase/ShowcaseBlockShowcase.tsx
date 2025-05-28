import { Component } from "solid-js";
import Button from '../button';
import ShowcaseBlock from './ShowcaseBlock';

const ShowcaseBlockShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic ShowcaseBlock</h2>
				<ShowcaseBlock
					title="Basic Example"
					description="This is a basic example of a ShowcaseBlock component."
				>
					<p>This is the content of the ShowcaseBlock.</p>
				</ShowcaseBlock>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">With Preview</h2>
				<ShowcaseBlock
					title="Preview Example"
					description="This ShowcaseBlock has the preview prop set to true."
					preview
				>
					<div class="flex flex-col items-center justify-center gap-4">
						<Button>Click Me</Button>
						<p>This content is displayed inside a preview container.</p>
					</div>
				</ShowcaseBlock>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Custom Styles</h2>
				<ShowcaseBlock
					title="Custom Styles Example"
					description="This ShowcaseBlock has custom classes applied."
					class="border-2 border-primary p-2"
				>
					<p>Content with custom parent styles.</p>
				</ShowcaseBlock>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">With Different Theme</h2>
				<ShowcaseBlock
					title="Themed Example"
					description="This ShowcaseBlock uses a different theme."
					dataTheme="dark"
				>
					<p>This content is shown with the dark theme.</p>
				</ShowcaseBlock>
			</section>
		</div>
	);
};

export default ShowcaseBlockShowcase; 