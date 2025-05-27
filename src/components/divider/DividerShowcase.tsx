import { type Component } from "solid-js";
import Divider from "./Divider";

const DividerShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Divider</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full flex-col">
						<div class="card bg-base-300 rounded-box grid h-20 place-items-center">Content</div>
						<Divider text="OR" />
						<div class="card bg-base-300 rounded-box grid h-20 place-items-center">Content</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Horizontal Divider</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full items-stretch">
						<div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">Content</div>
						<Divider horizontal text="OR" />
						<div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">Content</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Divider With No Text</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full flex-col">
						<div class="card bg-base-300 rounded-box grid h-20 place-items-center">Content</div>
						<Divider />
						<div class="card bg-base-300 rounded-box grid h-20 place-items-center">Content</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Responsive Divider</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full flex-col lg:flex-row lg:items-stretch lg:h-32">
						<div class="card bg-base-300 rounded-box grid h-32 grow place-items-center">Content</div>
						<div class="block lg:hidden">
							<Divider text="OR" />
						</div>
						<div class="hidden lg:flex lg:items-stretch">
							<Divider horizontal text="OR" />
						</div>
						<div class="card bg-base-300 rounded-box grid h-32 grow place-items-center">Content</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Divider With Colors</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full flex-col">
						<Divider text="Default" />
						<Divider color="neutral" text="Neutral" />
						<Divider color="primary" text="Primary" />
						<Divider color="secondary" text="Secondary" />
						<Divider color="accent" text="Accent" />
						<Divider color="success" text="Success" />
						<Divider color="warning" text="Warning" />
						<Divider color="info" text="Info" />
						<Divider color="error" text="Error" />
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Divider In Different Positions</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full flex-col">
						<Divider position="start" text="Start" />
						<Divider text="Default" />
						<Divider position="end" text="End" />
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Divider In Different Positions (Horizontal)</h2>
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex w-full items-center justify-center h-32 space-x-8">
						<div class="flex items-stretch h-24">
							<Divider horizontal position="start" text="Start" />
						</div>
						<div class="flex items-stretch h-24">
							<Divider horizontal text="Default" />
						</div>
						<div class="flex items-stretch h-24">
							<Divider horizontal position="end" text="End" />
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default DividerShowcase; 