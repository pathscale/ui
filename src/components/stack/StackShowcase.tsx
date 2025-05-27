import { type Component } from "solid-js";
import Button from "../button/Button";
import Stack from "./Stack";

const StackShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Stack</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-64">
						<div class="bg-primary text-primary-content p-4 text-center rounded-box">1</div>
						<div class="bg-secondary text-secondary-content p-4 text-center rounded-box">2</div>
						<div class="bg-accent text-accent-content p-4 text-center rounded-box">3</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Cards Stack (Default Direction)</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-96">
						<div class="card bg-base-300 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">First Card</h2>
							</div>
						</div>
						<div class="card bg-base-300 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Second Card</h2>
							</div>
						</div>
						<div class="card bg-base-300 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Third Card</h2>
							</div>
						</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Stacked Cards (Top Direction)</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-96" direction="top">
						<div class="card bg-primary text-primary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Top Card </h2>
							</div>
						</div>
						<div class="card bg-secondary text-secondary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Top Card</h2>
							</div>
						</div>
						<div class="card bg-accent text-accent-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Top Card </h2>
							</div>
						</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Stacked Cards (Bottom Direction)</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-96" direction="bottom">
						<div class="card bg-primary text-primary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Bottom Card</h2>
							</div>
						</div>
						<div class="card bg-secondary text-secondary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Bottom Card</h2>
							</div>
						</div>
						<div class="card bg-accent text-accent-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Bottom Card</h2>
							</div>
						</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Stacked Cards (Left Direction)</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-96" direction="left">
						<div class="card bg-primary text-primary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Left Card</h2>
							</div>
						</div>
						<div class="card bg-secondary text-secondary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Left Card</h2>
							</div>
						</div>
						<div class="card bg-accent text-accent-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Left Card</h2>
							</div>
						</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Stacked Cards (Right Direction)</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-96" direction="right">
						<div class="card bg-primary text-primary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Right Card</h2>
							</div>
						</div>
						<div class="card bg-secondary text-secondary-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Right Card</h2>
							</div>
						</div>
						<div class="card bg-accent text-accent-content shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Right Card</h2>
							</div>
						</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Images Stack</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-150 h-100">
						<img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Image 1" class="rounded-box" />
						<img src="https://img.daisyui.com/images/stock/photo-1559181567-c3fa683928bf.webp" alt="Image 2" class="rounded-box" />
						<img src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp" alt="Image 3" class="rounded-box" />
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Buttons Stack</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-64">
						<Button color="primary" class="w-full">Primary Button</Button>
						<Button color="secondary" class="w-full">Secondary Button</Button>
						<Button color="accent" class="w-full">Accent Button</Button>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Interactive Stack</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-96">
						<div class="rounded-box bg-base-300 p-4 hover:bg-primary hover:text-primary-content transition-colors duration-300 cursor-pointer">
							Hover me
						</div>
						<div class="rounded-box bg-base-300 p-4 hover:bg-secondary hover:text-secondary-content transition-colors duration-300 cursor-pointer">
							Hover me
						</div>
						<div class="rounded-box bg-base-300 p-4 hover:bg-accent hover:text-accent-content transition-colors duration-300 cursor-pointer">
							Hover me
						</div>
					</Stack>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Stack With Custom Elements</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Stack class="w-64" as="section">
						<article class="bg-primary text-primary-content p-4 text-center rounded-box">
							Article
						</article>
						<aside class="bg-secondary text-secondary-content p-4 text-center rounded-box">
							Aside
						</aside>
						<header class="bg-accent text-accent-content p-4 text-center rounded-box">
							Header
						</header>
					</Stack>
				</div>
			</section>
		</div>
	);
};

export default StackShowcase;