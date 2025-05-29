import { type Component } from 'solid-js';
import ShowcaseBlock from "../showcase";
import { ShowcaseSection } from "./index";

const ShowcaseSectionShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Default ShowcaseSection</h2>
				<ShowcaseSection id="default-section" title="Default Example">
					<p>This is a section that can be linked to via a URL fragment.</p>
					<p>Hover over the title to see the link icon, and click it to copy the link.</p>
				</ShowcaseSection>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">With Content</h2>
				<ShowcaseSection id="with-content" title="Content Example">
					<ShowcaseBlock title="Nested Block">
						<div class="p-4 bg-base-300 rounded">
							<p>The ShowcaseSection component works well with other UI components.</p>
							<button class="btn btn-primary mt-2">Example Button</button>
						</div>
					</ShowcaseBlock>
				</ShowcaseSection>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Custom Styling</h2>
				<ShowcaseSection
					id="custom-styling"
					title="Custom Styling Example"
					class="bg-primary/10 border border-primary/30"
				>
					<p>This section has custom styling applied through the class prop.</p>
				</ShowcaseSection>
			</section>
		</div>
	);
};

export default ShowcaseSectionShowcase; 