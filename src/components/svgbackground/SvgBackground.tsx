import { JSX, createEffect, createSignal, onMount } from 'solid-js';

export interface SvgBackgroundProps {
	/** Primary gradient color (CSS color value) */
	colorStart?: string;
	/** Secondary gradient color (CSS color value) */
	colorEnd?: string;
	/** Background color */
	backgroundColor?: string;
	/** Background opacity (0-1) */
	opacity?: number;
	/** Blur intensity (0-100) */
	blurIntensity?: number;
	/** Density of shapes (any positive number) */
	density?: number;
	/** Darkness overlay (0-1) */
	darkness?: number;
	class?: string;
	style?: JSX.CSSProperties;
	children?: JSX.Element;
}

let instanceCounter = 0;
function generateStableId() {
	return `svg-bg-${++instanceCounter}-${Date.now()}`;
}

function hexToRgb(hex: string) {
	hex = hex.replace(/^#/, '');

	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return { r, g, b };
}

export default function SvgBackground(props: SvgBackgroundProps) {
	const {
		colorStart = '#6366f1',
		colorEnd = '#4f46e5',
		backgroundColor = '#000000',
		opacity = 1,
		blurIntensity = 40,
		density = 5,
		darkness = 0,
		class: className = '',
		style = {},
		children,
	} = props;

	let containerRef: HTMLDivElement | undefined;
	let svgRef: SVGSVGElement | undefined;
	let canvasRef: HTMLCanvasElement | undefined;

	const [isBackgroundReady, setBackgroundReady] = createSignal(false);

	const getIntermediateColor = (t: number) => {
		const start = hexToRgb(colorStart);
		const end = hexToRgb(colorEnd);

		const r = Math.round(start.r + (end.r - start.r) * t);
		const g = Math.round(start.g + (end.g - start.g) * t);
		const b = Math.round(start.b + (end.b - start.b) * t);

		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	};

	const generateShapes = () => {
		const normalizedDensity = Math.max(1, density);

		const maxShapes = Math.min(200, Math.max(10, Math.ceil(15 + Math.sqrt(normalizedDensity) * 8)));

		const colors = [];
		for (let i = 0; i < maxShapes; i++) {
			const randomOffset = (Math.sin(i * 0.1) * 0.1);
			const t = (i / (maxShapes - 1)) + randomOffset;
			colors.push(getIntermediateColor(Math.max(0, Math.min(1, t))));
		}

		const seed = 42;
		const random = (i: number) => {
			const x = Math.sin(seed + i * 100) * 10000;
			return x - Math.floor(x);
		};

		const gridSize = Math.ceil(Math.sqrt(maxShapes / 1.5));
		const cellWidth = 400 / gridSize;
		const cellHeight = 400 / gridSize;

		const minRadius = 40;

		const baseCount = Math.ceil(gridSize * gridSize * 0.8);
		const baseShapes = [];

		const coveredGrid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false));

		for (let i = 0; i < gridSize; i++) {
			for (let j = 0; j < gridSize; j++) {
				if (baseShapes.length >= baseCount) continue;

				const isLeftSide = i < gridSize / 3;

				const leftSideMultiplier = isLeftSide ? 3 : 1;
				const skipChance = Math.max(0, (0.2 - (normalizedDensity / 100)) * leftSideMultiplier);
				if (random(i * 100 + j) < skipChance) continue;

				coveredGrid[i][j] = true;

				const randomOffsetMultiplier = isLeftSide ? 1.5 : 1;
				const randomOffset = Math.min(cellWidth, cellHeight) * 0.4 * (1 - Math.min(1, normalizedDensity / 50)) * randomOffsetMultiplier;
				const cx = (i * cellWidth) + (cellWidth / 2) + (random(i * 200 + j) * 2 - 1) * randomOffset;
				const cy = (j * cellHeight) + (cellHeight / 2) + (random(i * 300 + j) * 2 - 1) * randomOffset;

				const sizeRatioBase = Math.max(0.6, 1.2 - (Math.log10(normalizedDensity + 1) * 0.15));
				const sizeRatio = isLeftSide ? sizeRatioBase * 0.8 : sizeRatioBase;
				const baseRadius = Math.min(cellWidth, cellHeight) * sizeRatio;

				const sizeVariationBase = Math.max(0.2, 0.5 - (normalizedDensity / 200));
				const sizeVariation = isLeftSide ? sizeVariationBase * 1.5 : sizeVariationBase;
				const radius = Math.max(minRadius, baseRadius * (0.8 + random(i * 400 + j) * sizeVariation));

				const colorIndexBase = Math.floor(random(i * 500 + j) * colors.length);
				const colorIndex = isLeftSide ?
					Math.floor((colorIndexBase + random(i * 600 + j) * colors.length) / 2) :
					colorIndexBase;
				const color = colors[colorIndex];

				const opacity = isLeftSide && random(i * 700 + j) > 0.6 ?
					0.7 + random(i * 800 + j) * 0.3 :
					1;

				const ellipseChance = isLeftSide ? 0.6 : 0.4;
				if (random(i * 600 + j) > (1 - ellipseChance)) {
					const rx = radius;
					const ry = Math.max(minRadius, radius * (0.6 + random(i * 700 + j) * 0.8));
					const rotation = random(i * 800 + j) * 360;

					baseShapes.push(
						<ellipse
							cx={cx.toString()}
							cy={cy.toString()}
							rx={rx.toString()}
							ry={ry.toString()}
							fill={color}
							opacity={opacity.toString()}
							transform={`rotate(${rotation} ${cx} ${cy})`}
						/>
					);
				} else {
					baseShapes.push(
						<circle
							cx={cx.toString()}
							cy={cy.toString()}
							r={radius.toString()}
							fill={color}
							opacity={opacity.toString()}
						/>
					);
				}
			}
		}

		for (let i = 0; i < gridSize; i++) {
			for (let j = 0; j < gridSize; j++) {
				if (!coveredGrid[i][j]) {
					const isLeftSide = i < gridSize / 3;

					if (isLeftSide && random(i * 900 + j) < 0.3) continue;

					const cx = (i * cellWidth) + (cellWidth / 2);
					const cy = (j * cellHeight) + (cellHeight / 2);

					const radiusBase = Math.min(cellWidth, cellHeight) * 0.7;
					const radius = Math.max(minRadius, isLeftSide ? radiusBase * 0.8 : radiusBase);

					const colorIndex = Math.floor(random(i * 900 + j) * colors.length);
					const opacity = isLeftSide ? 0.7 + random(i * 950 + j) * 0.3 : 1;

					baseShapes.push(
						<circle
							cx={cx.toString()}
							cy={cy.toString()}
							r={radius.toString()}
							fill={colors[colorIndex]}
							opacity={opacity.toString()}
						/>
					);
				}
			}
		}

		const edgeShapes = [
			<circle cx="0" cy="0" r="100" fill={colorStart} opacity="0.7" />,
			<circle cx="400" cy="0" r="120" fill={getIntermediateColor(0.25)} />,
			<circle cx="0" cy="400" r="100" fill={getIntermediateColor(0.75)} opacity="0.7" />,
			<circle cx="400" cy="400" r="120" fill={colorEnd} />,

			<circle cx="0" cy="200" r="70" fill={getIntermediateColor(0.65)} opacity="0.6" />,
			<circle cx="200" cy="0" r="100" fill={getIntermediateColor(0.15)} />,
			<circle cx="400" cy="200" r="100" fill={getIntermediateColor(0.4)} />,
			<circle cx="200" cy="400" r="100" fill={getIntermediateColor(0.85)} />
		];

		const accentShapes = [];
		const accentCount = Math.max(0, maxShapes - baseShapes.length - edgeShapes.length);

		const leftSideAccentCount = Math.floor(accentCount * 0.6);
		const rightSideAccentCount = accentCount - leftSideAccentCount;

		for (let i = 0; i < leftSideAccentCount; i++) {
			const cx = 20 + random(1000 + i) * 120;
			const cy = 20 + random(2000 + i) * 360;

			const radius = minRadius * (0.5 + random(3000 + i) * 0.6);

			const colorIndex = Math.floor(random(4000 + i) * colors.length);

			const opacity = 0.6 + random(5500 + i) * 0.4;

			if (random(5000 + i) > 0.4) {
				accentShapes.push(
					<circle
						cx={cx.toString()}
						cy={cy.toString()}
						r={radius.toString()}
						fill={colors[colorIndex]}
						opacity={opacity.toString()}
					/>
				);
			} else {
				const rx = radius;
				const ry = radius * (0.4 + random(6000 + i) * 0.6);
				const rotation = random(7000 + i) * 360;

				accentShapes.push(
					<ellipse
						cx={cx.toString()}
						cy={cy.toString()}
						rx={rx.toString()}
						ry={ry.toString()}
						fill={colors[colorIndex]}
						opacity={opacity.toString()}
						transform={`rotate(${rotation} ${cx} ${cy})`}
					/>
				);
			}
		}

		for (let i = 0; i < rightSideAccentCount; i++) {
			const cx = 140 + random(8000 + i) * 260;
			const cy = 20 + random(9000 + i) * 360;

			const radius = minRadius * (0.7 + random(10000 + i) * 0.8);

			const colorIndex = Math.floor(random(11000 + i) * colors.length);

			if (random(12000 + i) > 0.3) {
				accentShapes.push(
					<circle
						cx={cx.toString()}
						cy={cy.toString()}
						r={radius.toString()}
						fill={colors[colorIndex]}
					/>
				);
			} else {
				const rx = radius;
				const ry = radius * (0.5 + random(13000 + i) * 0.8);
				const rotation = random(14000 + i) * 360;

				accentShapes.push(
					<ellipse
						cx={cx.toString()}
						cy={cy.toString()}
						rx={rx.toString()}
						ry={ry.toString()}
						fill={colors[colorIndex]}
						transform={`rotate(${rotation} ${cx} ${cy})`}
					/>
				);
			}
		}

		return [...edgeShapes, ...baseShapes, ...accentShapes];
	};

	const renderSvgToCanvas = () => {
		if (!svgRef || !canvasRef) return;

		const svgData = new XMLSerializer().serializeToString(svgRef);
		const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
		const svgUrl = URL.createObjectURL(svgBlob);

		const img = new Image();
		img.src = svgUrl;

		img.onload = () => {
			if (!canvasRef) return;

			if (containerRef) {
				const rect = containerRef.getBoundingClientRect();
				const blurPadding = Math.ceil(blurIntensity * 2);
				canvasRef.width = rect.width + blurPadding * 2;
				canvasRef.height = rect.height + blurPadding * 2;
			}

			const ctx = canvasRef.getContext('2d');
			if (!ctx) return;

			ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

			ctx.drawImage(img, -blurIntensity * 2, -blurIntensity * 2, canvasRef.width + blurIntensity * 4, canvasRef.height + blurIntensity * 4);

			URL.revokeObjectURL(svgUrl);

			setBackgroundReady(true);
		};
	};

	onMount(() => {
		if (window && 'ResizeObserver' in window) {
			const observer = new ResizeObserver(() => {
				renderSvgToCanvas();
			});

			if (containerRef) {
				observer.observe(containerRef);
			}

			return () => {
				if (containerRef) {
					observer.unobserve(containerRef);
				}
			};
		}

		renderSvgToCanvas();
	});

	createEffect(() => {
		const _ = [colorStart, colorEnd, backgroundColor, opacity, blurIntensity, density];

		setTimeout(() => {
			renderSvgToCanvas();
		}, 0);
	});

	const backgroundStyle = (): JSX.CSSProperties => {
		return {
			position: 'relative',
			overflow: 'hidden',
			...style,
		};
	};

	const canvasStyle = (): JSX.CSSProperties => {
		return {
			position: 'absolute',
			top: `-${blurIntensity * 2}px`,
			left: `-${blurIntensity * 2}px`,
			width: `calc(100% + ${blurIntensity * 4}px)`,
			height: `calc(100% + ${blurIntensity * 4}px)`,
			'z-index': '0',
			opacity: opacity.toString(),
			filter: `blur(${blurIntensity}px)`,
		};
	};

	const contentClasses = "relative z-10 h-full w-full";

	return (
		<div
			ref={containerRef}
			class={`relative flex items-center justify-center ${className}`}
			style={backgroundStyle()}
		>
			<div style={{ display: 'none' }}>
				<svg
					ref={svgRef}
					viewBox="0 0 400 400"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect width="400" height="400" fill={backgroundColor} />
					{generateShapes()}
				</svg>
			</div>

			<canvas
				ref={canvasRef}
				style={canvasStyle()}
			/>

			{darkness > 0 && (
				<div
					class="absolute inset-0 z-5"
					style={{
						'background-color': `rgba(0, 0, 0, ${darkness})`,
						'pointer-events': 'none',
					}}
				/>
			)}

			<div class={contentClasses}>
				{children}
			</div>
		</div>
	);
}
