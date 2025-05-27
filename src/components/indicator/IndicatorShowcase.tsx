import { type Component } from "solid-js";
import Button from "../button/Button";
import { Indicator, IndicatorItem } from "./Indicator";

const IndicatorShowcase: Component = () => {
	return (
		<div class="space-y-12 p-8">
			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Status Indicator</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem class="status status-success" />
						<div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
							content
						</div>
					</Indicator>
					<Indicator>
						<IndicatorItem class="status status-error" />
						<div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
							content
						</div>
					</Indicator>
					<Indicator>
						<IndicatorItem class="status status-warning" />
						<div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
							content
						</div>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Badge as Indicator</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem class="badge badge-primary">New</IndicatorItem>
						<div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
							content
						</div>
					</Indicator>
					<Indicator>
						<IndicatorItem class="badge badge-secondary">Hot</IndicatorItem>
						<div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
							content
						</div>
					</Indicator>
					<Indicator>
						<IndicatorItem class="badge badge-accent">Sale</IndicatorItem>
						<div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
							content
						</div>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">For Button</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem class="badge badge-secondary">12</IndicatorItem>
						<Button>inbox</Button>
					</Indicator>
					<Indicator>
						<IndicatorItem class="badge badge-error">99+</IndicatorItem>
						<Button color="primary">notifications</Button>
					</Indicator>
					<Indicator>
						<IndicatorItem class="badge badge-success">3</IndicatorItem>
						<Button variant="outline">messages</Button>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">For Avatar</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator class="avatar">
						<IndicatorItem class="badge badge-secondary">online</IndicatorItem>
						<div class="h-20 w-20 rounded-box">
							<img
								alt="Avatar example"
								src="https://img.daisyui.com/images/profile/demo/2@94.webp"
								class="rounded-box"
							/>
						</div>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">For Input</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem class="badge">Required</IndicatorItem>
						<input
							type="text"
							placeholder="Your email address"
							class="input input-bordered"
						/>
					</Indicator>
					<Indicator>
						<IndicatorItem class="badge badge-error">Error</IndicatorItem>
						<input
							type="text"
							placeholder="Invalid input"
							class="input input-bordered input-error"
						/>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Button as Indicator for Card</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem vertical="bottom">
							<Button color="primary">Apply</Button>
						</IndicatorItem>
						<div class="card border-base-300 border shadow-sm">
							<div class="card-body">
								<h2 class="card-title">Job Title</h2>
								<p>Rerum reiciendis beatae tenetur excepturi</p>
							</div>
						</div>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">In Center of Image</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem
							horizontal="center"
							vertical="middle"
							class="badge badge-neutral"
						>
							Pro Only
						</IndicatorItem>
						<img
							alt="Example image"
							src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
							class="w-64 h-40 object-cover rounded-box"
						/>
					</Indicator>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Position Examples</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div class="space-y-4">
						<h3 class="font-medium">Top Positions</h3>
						<div class="space-y-2 flex gap-5">
							<Indicator>
								<IndicatorItem
									horizontal="start"
									vertical="top"
									class="badge badge-secondary"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									top-start
								</div>
							</Indicator>
							<Indicator>
								<IndicatorItem
									horizontal="center"
									vertical="top"
									class="badge badge-secondary"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									top-center
								</div>
							</Indicator>
							<Indicator>
								<IndicatorItem
									horizontal="end"
									vertical="top"
									class="badge badge-secondary"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									top-end
								</div>
							</Indicator>
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="font-medium">Middle Positions</h3>
						<div class="space-y-2 flex gap-5">
							<Indicator>
								<IndicatorItem
									horizontal="start"
									vertical="middle"
									class="badge badge-accent"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									middle-start
								</div>
							</Indicator>
							<Indicator>
								<IndicatorItem
									horizontal="center"
									vertical="middle"
									class="badge badge-accent"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									middle-center
								</div>
							</Indicator>
							<Indicator>
								<IndicatorItem
									horizontal="end"
									vertical="middle"
									class="badge badge-accent"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									middle-end
								</div>
							</Indicator>
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="font-medium">Bottom Positions</h3>
						<div class="space-y-2 flex gap-5">
							<Indicator>
								<IndicatorItem
									horizontal="start"
									vertical="bottom"
									class="badge badge-warning"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									bottom-start
								</div>
							</Indicator>
							<Indicator>
								<IndicatorItem
									horizontal="center"
									vertical="bottom"
									class="badge badge-warning"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									bottom-center
								</div>
							</Indicator>
							<Indicator>
								<IndicatorItem
									horizontal="end"
									vertical="bottom"
									class="badge badge-warning"
								/>
								<div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
									bottom-end
								</div>
							</Indicator>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b pb-2 mb-4">Multiple Indicators</h2>
				<div class="flex flex-wrap items-center gap-4">
					<Indicator>
						<IndicatorItem
							horizontal="start"
							vertical="top"
							class="badge"
						>
							↖︎
						</IndicatorItem>
						<IndicatorItem
							horizontal="center"
							vertical="top"
							class="badge"
						>
							↑
						</IndicatorItem>
						<IndicatorItem
							horizontal="end"
							vertical="top"
							class="badge"
						>
							↗︎
						</IndicatorItem>
						<IndicatorItem
							horizontal="start"
							vertical="middle"
							class="badge"
						>
							←
						</IndicatorItem>
						<IndicatorItem
							horizontal="center"
							vertical="middle"
							class="badge"
						>
							●
						</IndicatorItem>
						<IndicatorItem
							horizontal="end"
							vertical="middle"
							class="badge"
						>
							→
						</IndicatorItem>
						<IndicatorItem
							horizontal="start"
							vertical="bottom"
							class="badge"
						>
							↙︎
						</IndicatorItem>
						<IndicatorItem
							horizontal="center"
							vertical="bottom"
							class="badge"
						>
							↓
						</IndicatorItem>
						<IndicatorItem
							horizontal="end"
							vertical="bottom"
							class="badge"
						>
							↘︎
						</IndicatorItem>
						<div class="bg-base-300 grid h-32 w-60 place-items-center rounded-box" />
					</Indicator>
				</div>
			</section>
		</div>
	);
};

export default IndicatorShowcase; 