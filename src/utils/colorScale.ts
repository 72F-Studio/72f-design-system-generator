// src/utils/colorScale.ts - Perceptual HSL-based color scale generator

function hexToHsl(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s * 100, l * 100];
}

function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function hslToHex(h: number, s: number, l: number): string {
    h = h / 360; s = s / 100; l = l / 100;
    let r: number, g: number, b: number;
    if (s === 0) {
        r = g = b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x: number) => Math.round(Math.max(0, Math.min(255, x * 255))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Tint toward white in HSL space (w: 0=original, 1=white)
function tint(h: number, s: number, l: number, w: number): string {
    return hslToHex(h, s * (1 - w), l + (100 - l) * w);
}

// Shade toward black in HSL space (w: 0=original, 1=black)
function shade(h: number, s: number, l: number, w: number): string {
    return hslToHex(h, s * (1 - w * 0.4), l * (1 - w));
}

const SCALE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
export type ColorStep = typeof SCALE_STEPS[number];

// Tint/shade weights per step. 500 = base color.
const TINT_WEIGHTS: Record<string, number> = {
    '50': 0.94, '100': 0.87, '200': 0.73, '300': 0.56, '400': 0.32,
};
const SHADE_WEIGHTS: Record<string, number> = {
    '600': 0.15, '700': 0.30, '800': 0.50, '900': 0.65, '950': 0.78,
};

/**
 * Generate an 11-step perceptual color scale from a base hex color.
 * Uses HSL tinting/shading to preserve hue and produce natural-looking ramps.
 */
export function generateColorScale(hex: string): Record<ColorStep, string> {
    if (!hex || !hex.startsWith('#')) return {} as any;
    const [h, s, l] = hexToHsl(hex);
    const result: Partial<Record<ColorStep, string>> = {};

    for (const step of SCALE_STEPS) {
        if (step === '500') {
            result['500'] = hex;
        } else if (step in TINT_WEIGHTS) {
            result[step] = tint(h, s, l, TINT_WEIGHTS[step]);
        } else {
            result[step] = shade(h, s, l, SHADE_WEIGHTS[step]);
        }
    }

    return result as Record<ColorStep, string>;
}

/**
 * Find the closest step in a generated scale to a given target hex.
 * Useful for mapping contrast-adjusted semantic colors back to primitive refs.
 */
export function findClosestStep(targetHex: string, scale: Record<ColorStep, string>): ColorStep {
    const [_th, _ts, tl] = hexToHsl(targetHex);
    let closest: ColorStep = '500';
    let minDiff = Infinity;
    for (const step of SCALE_STEPS) {
        const [_h, _s, l] = hexToHsl(scale[step]);
        const diff = Math.abs(l - tl);
        if (diff < minDiff) { minDiff = diff; closest = step; }
    }
    return closest;
}
