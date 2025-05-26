import { type Component } from "solid-js"
import Tabs from './Tabs'

const TabsShowcase: Component = () => {

	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Tabs</h2>
				<Tabs items={[{ label: "Tab 1", content: "Tab 1 content" }, { label: "Tab 2", content: "Tab 2 content" }, { label: "Tab 3", content: "Tab 3 content" }]} />
			</section>
		</div>
	)
}

export default TabsShowcase
