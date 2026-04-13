
export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

export interface RGB {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
}

export interface RGBA extends RGB {
    a: number; // 0-1
}

export interface HSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

export interface HSLA extends HSL {
    a: number; // 0-1
}

export interface ColorValue {
    rgb: RGBA;
    hsl: HSLA;
    hex: string;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
    const cleaned = hex.replace(/^#/, "");

    if (cleaned.length === 3) {
        const r = Number.parseInt(cleaned[0] + cleaned[0], 16);
        const g = Number.parseInt(cleaned[1] + cleaned[1], 16);
        const b = Number.parseInt(cleaned[2] + cleaned[2], 16);
        return { r, g, b };
    }

    if (cleaned.length === 6) {
        const r = Number.parseInt(cleaned.substring(0, 2), 16);
        const g = Number.parseInt(cleaned.substring(2, 4), 16);
        const b = Number.parseInt(cleaned.substring(4, 6), 16);
        return { r, g, b };
    }

    return null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

        switch (max) {
            case rNorm:
                h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
                break;
            case gNorm:
                h = ((bNorm - rNorm) / delta + 2) / 6;
                break;
            case bNorm:
                h = ((rNorm - gNorm) / delta + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
        let tNorm = t;
        if (tNorm < 0) tNorm += 1;
        if (tNorm > 1) tNorm -= 1;
        if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
        if (tNorm < 1 / 2) return q;
        if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
        return p;
    };

    if (sNorm === 0) {
        const gray = Math.round(lNorm * 255);
        return { r: gray, g: gray, b: gray };
    }

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;

    return {
        r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, hNorm) * 255),
        b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
    };
}

/**
 * Parse color string to ColorValue
 */
export function parseColor(color: string): ColorValue | null {
    const trimmed = color.trim();

    // Parse hex
    if (trimmed.startsWith("#")) {
        const rgb = hexToRgb(trimmed);
        if (!rgb) return null;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return {
            rgb: { ...rgb, a: 1 },
            hsl: { ...hsl, a: 1 },
            hex: trimmed,
        };
    }

    // Parse rgb/rgba
    const rgbMatch = trimmed.match(
        /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/,
    );
    if (rgbMatch) {
        const r = Number.parseInt(rgbMatch[1], 10);
        const g = Number.parseInt(rgbMatch[2], 10);
        const b = Number.parseInt(rgbMatch[3], 10);
        const a = rgbMatch[4] ? Number.parseFloat(rgbMatch[4]) : 1;
        const hsl = rgbToHsl(r, g, b);
        return {
            rgb: { r, g, b, a },
            hsl: { ...hsl, a },
            hex: rgbToHex(r, g, b),
        };
    }

    // Parse hsl/hsla
    const hslMatch = trimmed.match(
        /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/,
    );
    if (hslMatch) {
        const h = Number.parseFloat(hslMatch[1]);
        const s = Number.parseFloat(hslMatch[2]);
        const l = Number.parseFloat(hslMatch[3]);
        const a = hslMatch[4] ? Number.parseFloat(hslMatch[4]) : 1;
        const rgb = hslToRgb(h, s, l);
        return {
            rgb: { ...rgb, a },
            hsl: { h, s, l, a },
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        };
    }

    return null;
}

/**
 * Format ColorValue to specified format string
 */
export function formatColor(color: ColorValue, format: ColorFormat): string {
    switch (format) {
        case "hex":
            return color.hex;
        case "rgb":
            return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
        case "rgba":
            return `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
        case "hsl":
            return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
        case "hsla":
            return `hsla(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%, ${color.hsl.a})`;
        default:
            return color.hex;
    }
}

/**
 * Set alpha channel of a ColorValue
 */
export function setAlpha(color: ColorValue, alpha: number): ColorValue {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return {
        ...color,
        rgb: { ...color.rgb, a: clampedAlpha },
        hsl: { ...color.hsl, a: clampedAlpha },
    };
}

/**
 * Create ColorValue from HSL values
 */
export function createColorFromHsl(
    h: number,
    s: number,
    l: number,
    a = 1,
): ColorValue {
    const rgb = hslToRgb(h, s, l);
    return {
        rgb: { ...rgb, a },
        hsl: { h, s, l, a },
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    };
}

/**
 * Get default color value (white)
 */
export function getDefaultColor(): ColorValue {
    return {
        rgb: { r: 255, g: 255, b: 255, a: 1 },
        hsl: { h: 0, s: 0, l: 100, a: 1 },
        hex: "#ffffff",
    };
}
