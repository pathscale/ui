import { Component } from "solid-js";
import Button from '../button';
import ShowcaseBlock from './ShowcaseBlock';
import "./ShowcaseBlockShowcase.css";

const ShowcaseBlockShowcase: Component = () => {
	return (
		<div class="showcase-demo">
			<section class="showcase-demo__section">
				<h2 class="showcase-demo__section-title">Basic ShowcaseBlock</h2>
				<ShowcaseBlock
					title="Basic Example"
					description="This is a basic example of a ShowcaseBlock component."
				>
					<p>This is the content of the ShowcaseBlock.</p>
				</ShowcaseBlock>
			</section>

			<section class="showcase-demo__section">
				<h2 class="showcase-demo__section-title">With Preview</h2>
				<ShowcaseBlock
					title="Preview Example"
					description="This ShowcaseBlock has the preview prop set to true."
					preview
				>
					<div class="showcase-demo__preview-content">
						<Button>Click Me</Button>
						<p>This content is displayed inside a preview container.</p>
					</div>
				</ShowcaseBlock>
			</section>

			<section class="showcase-demo__section">
				<h2 class="showcase-demo__section-title">Custom Styles</h2>
				<ShowcaseBlock
					title="Custom Styles Example"
					description="This ShowcaseBlock has custom classes applied."
					class="showcase-demo__custom-showcase"
				>
					<p>Content with custom parent styles.</p>
				</ShowcaseBlock>
			</section>

			<section class="showcase-demo__section">
				<h2 class="showcase-demo__section-title">With Different Theme</h2>
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