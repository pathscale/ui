import { JSX, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';

export interface SvgBackgroundProps {
	/** Primary gradient color (CSS color value) */
	colorStart?: string;
	/** Secondary gradient color (CSS color value) */
	colorEnd?: string;
	/** Background opacity (0-1) */
	opacity?: number;
	/** Blur intensity (0-100) */
	blurIntensity?: number;
	/** Turbulence frequency for noise effect */
	turbulenceFrequency?: number;
	animated?: boolean;
	animationSpeed?: number;
	class?: string;
	style?: JSX.CSSProperties;
	children?: JSX.Element;
	darkness?: number;
}

function hexToHsl(hex: string) {
	hex = hex.replace('#', '');

	const r = parseInt(hex.substr(0, 2), 16) / 255;
	const g = parseInt(hex.substr(2, 2), 16) / 255;
	const b = parseInt(hex.substr(4, 2), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100)
	};
}

function parseColor(colorString: string) {
	const hslMatch = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
	if (hslMatch) {
		return {
			h: parseInt(hslMatch[1]),
			s: parseInt(hslMatch[2]),
			l: parseInt(hslMatch[3])
		};
	}

	const hexMatch = colorString.match(/^#?([a-fA-F0-9]{6})$/);
	if (hexMatch) {
		return hexToHsl(colorString);
	}

	const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (rgbMatch) {
		const r = parseInt(rgbMatch[1]) / 255;
		const g = parseInt(rgbMatch[2]) / 255;
		const b = parseInt(rgbMatch[3]) / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0;
		let s = 0;
		const l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100)
		};
	}

	return { h: 0, s: 0, l: 0 };
}

function parseHSL(hslString: string) {
	const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
	if (!match) return null;
	return {
		h: parseInt(match[1]),
		s: parseInt(match[2]),
		l: parseInt(match[3])
	};
}

function interpolateHue(h1: number, h2: number, t: number): number {
	const diff = h2 - h1;
	if (Math.abs(diff) > 180) {
		if (diff > 0) {
			h1 += 360;
		} else {
			h2 += 360;
		}
	}
	return ((h1 + (h2 - h1) * t) + 360) % 360;
}

let instanceCounter = 0;
function generateStableId() {
	return `svg-bg-${++instanceCounter}-${Date.now()}`;
}

export default function SvgBackground(props: SvgBackgroundProps) {
	const {
		colorStart = '#000000',
		colorEnd = '#333333',
		opacity = 1,
		blurIntensity = 36,
		turbulenceFrequency = 0.007,
		animated = false,
		animationSpeed = 1,
		class: className = '',
		style = {},
		children,
		darkness = 0,
	} = props;

	const [animationTime, setAnimationTime] = createSignal(0);
	let animationFrame: number | null = null;
	let gradientStop1Ref: SVGStopElement | undefined;
	let gradientStop2Ref: SVGStopElement | undefined;
	let turbulenceRef: SVGFETurbulenceElement | undefined;

	const gradientId = `gradient-${generateStableId()}`;
	const filterId = `filter-${generateStableId()}`;

	const shouldUseFilters = createMemo(() => {
		return blurIntensity > 0 && turbulenceFrequency > 0.001;
	});

	const isGrayscaleColors = createMemo(() => {
		const startHSL = parseColor(colorStart);
		const endHSL = parseColor(colorEnd);
		return startHSL.s < 15 && endHSL.s < 15;
	});

	onMount(() => {
		if (animated) {
			const animate = () => {
				setAnimationTime(prev => prev + (0.008 * animationSpeed));
				animationFrame = requestAnimationFrame(animate);
			};
			animate();
		}
	});

	onCleanup(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});

	const startHSL = createMemo(() => parseColor(colorStart));
	const endHSL = createMemo(() => parseColor(colorEnd));

	const animatedColors = createMemo(() => {
		if (!animated) {
			return {
				color1: colorStart,
				color2: colorEnd,
				turbFreq1: turbulenceFrequency,
				turbFreq2: turbulenceFrequency * 0.4,
			};
		}

		const time = animationTime();
		const baseSpeed = 0.001 * animationSpeed;

		const freq1 = time * baseSpeed * 7;
		const freq2 = time * baseSpeed * 11;
		const freq3 = time * baseSpeed * 13;
		const freq4 = time * baseSpeed * 17;
		const freq5 = time * baseSpeed * 19;

		const wave1 = Math.sin(freq1) * 0.3;
		const wave2 = Math.sin(freq2) * 0.25;
		const wave3 = Math.sin(freq3) * 0.2;
		const wave4 = Math.sin(freq4) * 0.15;
		const wave5 = Math.sin(freq5) * 0.1;

		const combinedWave = wave1 + wave2 + wave3 + wave4 + wave5;
		const colorMix = (combinedWave + 1) / 2;

		const wave1b = Math.cos(freq2) * 0.3;
		const wave2b = Math.cos(freq3) * 0.25;
		const wave3b = Math.cos(freq4) * 0.2;
		const wave4b = Math.cos(freq5) * 0.15;
		const wave5b = Math.cos(freq1) * 0.1;

		const combinedWave2 = wave1b + wave2b + wave3b + wave4b + wave5b;
		const colorMix2 = (combinedWave2 + 1) / 2;

		const turbMix1 = (Math.sin(freq1 * 0.3) * 0.5 + Math.cos(freq2 * 0.2) * 0.5 + 1) / 2;
		const turbMix2 = (Math.cos(freq3 * 0.2) * 0.5 + Math.sin(freq4 * 0.3) * 0.5 + 1) / 2;

		let color1 = colorStart;
		let color2 = colorEnd;

		const start = startHSL();
		const end = endHSL();

		const h1 = interpolateHue(start.h, end.h, colorMix);
		const s1 = start.s + (end.s - start.s) * colorMix;
		const l1 = start.l + (end.l - start.l) * colorMix;

		const h2 = interpolateHue(start.h, end.h, colorMix2);
		const s2 = start.s + (end.s - start.s) * colorMix2;
		const l2 = start.l + (end.l - start.l) * colorMix2;

		color1 = `hsl(${Math.round(h1)}, ${Math.round(s1)}%, ${Math.round(l1)}%)`;
		color2 = `hsl(${Math.round(h2)}, ${Math.round(s2)}%, ${Math.round(l2)}%)`;

		const turbFreq1 = turbulenceFrequency + (turbulenceFrequency * 0.01 * turbMix1);
		const turbFreq2 = (turbulenceFrequency * 0.4) + (turbulenceFrequency * 0.01 * turbMix2);

		return { color1, color2, turbFreq1, turbFreq2 };
	});

	createEffect(() => {
		const colors = animatedColors();

		if (gradientStop1Ref) {
			gradientStop1Ref.setAttribute('stop-color', colors.color1);
		}
		if (gradientStop2Ref) {
			gradientStop2Ref.setAttribute('stop-color', colors.color2);
		}
		if (turbulenceRef) {
			turbulenceRef.setAttribute('baseFrequency', `${colors.turbFreq1} ${colors.turbFreq2}`);
		}
	});

	const backgroundStyle = createMemo((): JSX.CSSProperties => {
		return {
			position: 'relative',
			...style,
		};
	});

	const contentClasses = "relative z-10 h-full w-full";

	return (
		<div
			class={`relative ${className}`}
			style={backgroundStyle()}
		>
			<svg
				class="absolute inset-0 w-full h-full z-0"
				style={{ opacity: opacity.toString() }}
				viewBox="0 0 400 400"
				preserveAspectRatio="xMidYMid slice"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient
						gradientTransform="rotate(63, 0.5, 0.5)"
						x1="50%" y1="0%" x2="50%" y2="100%"
						id={gradientId}
					>
						<stop
							ref={gradientStop1Ref}
							stop-color={animatedColors().color1}
							stop-opacity="1"
							offset="0%"
						/>
						<stop
							ref={gradientStop2Ref}
							stop-color={animatedColors().color2}
							stop-opacity="1"
							offset="100%"
						/>
					</linearGradient>
					{shouldUseFilters() && (
						<filter
							id={filterId}
							x="-20%" y="-20%" width="140%" height="140%"
							filterUnits="objectBoundingBox"
							primitiveUnits="userSpaceOnUse"
							color-interpolation-filters="sRGB"
						>
							{isGrayscaleColors() ? (
								<feGaussianBlur
									stdDeviation={`${blurIntensity * 0.3} ${blurIntensity * 0.3}`}
									in="SourceGraphic"
									result="blur"
								/>
							) : (
								<>
									<feTurbulence
										ref={turbulenceRef}
										type="fractalNoise"
										baseFrequency={`${animatedColors().turbFreq1} ${animatedColors().turbFreq2}`}
										numOctaves="2"
										seed="10"
										stitchTiles="stitch"
										result="turbulence"
									/>
									<feGaussianBlur
										stdDeviation={`${blurIntensity} ${blurIntensity}`}
										in="turbulence"
										result="blur"
									/>
									<feBlend
										mode={"color-dodge" as any}
										in="SourceGraphic"
										in2="blur"
										result="blend"
									/>
								</>
							)}
						</filter>
					)}
				</defs>
				<rect
					width="400"
					height="400"
					fill={`url(#${gradientId})`}
					filter={shouldUseFilters() ? `url(#${filterId})` : 'none'}
				/>
			</svg>

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
