import { type Component } from 'solid-js';
import { CodeMockup, CodeMockupLine } from "./index";

const CodeMockupShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
				<CodeMockup>
					<CodeMockupLine>npm install right-ui</CodeMockupLine>
					<CodeMockupLine>installing packages...</CodeMockupLine>
					<CodeMockupLine>packages installed!</CodeMockupLine>
				</CodeMockup>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">With Status</h2>
				<CodeMockup>
					<CodeMockupLine status="info">// This is an info line</CodeMockupLine>
					<CodeMockupLine status="success">// This is a success line</CodeMockupLine>
					<CodeMockupLine status="warning">// This is a warning line</CodeMockupLine>
					<CodeMockupLine status="error">// This is an error line</CodeMockupLine>
				</CodeMockup>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Custom Prefix</h2>
				<CodeMockup>
					<CodeMockupLine dataPrefix="$">cd project</CodeMockupLine>
					<CodeMockupLine dataPrefix="$">npm start</CodeMockupLine>
					<CodeMockupLine dataPrefix="">Starting development server...</CodeMockupLine>
					<CodeMockupLine dataPrefix="">Server running on http://localhost:3000</CodeMockupLine>
				</CodeMockup>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">No Prefix</h2>
				<CodeMockup>
					<CodeMockupLine dataPrefix={false}>function example() &#123;</CodeMockupLine>
					<CodeMockupLine dataPrefix={false}>  return 'Hello World';</CodeMockupLine>
					<CodeMockupLine dataPrefix={false}>&#125;</CodeMockupLine>
				</CodeMockup>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Dark Theme</h2>
				<CodeMockup dataTheme="dark">
					<CodeMockupLine>const greeting = 'Hello';</CodeMockupLine>
					<CodeMockupLine>console.log(greeting);</CodeMockupLine>
					<CodeMockupLine>// Dark Theme Example</CodeMockupLine>
				</CodeMockup>
			</section>
		</div>
	);
};

export default CodeMockupShowcase;