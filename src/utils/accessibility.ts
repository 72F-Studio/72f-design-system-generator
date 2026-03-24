// src/utils/accessibility.ts

export function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

/**
 * Calculates relative luminance of a color based on WCAG 2.1
 */
export function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    const a = rgb.map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates contrast ratio between two colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const light = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (light + 0.05) / (dark + 0.05);
}

/**
 * Adjusts a color's brightness until it meets a target contrast ratio against a background.
 * Direction is determined by background luminance (Darken for light bg, Lighten for dark bg).
 */
export function ensureContrast(colorHex: string, bgHex: string, targetRatio = 4.5): string {
    const bgLuminance = getLuminance(bgHex);
    const isDarkBg = bgLuminance < 0.5;
    
    let currentHex = colorHex;
    let currentRatio = getContrastRatio(currentHex, bgHex);
    
    if (currentRatio >= targetRatio) return currentHex;

    // Iterative adjustment
    let [r, g, b] = hexToRgb(currentHex);
    const step = isDarkBg ? 5 : -5; // Lighten if dark bg, Darken if light bg

    for (let i = 0; i < 50; i++) { // Max 50 iterations to prevent infinite loops
        r = Math.max(0, Math.min(255, r + step));
        g = Math.max(0, Math.min(255, g + step));
        b = Math.max(0, Math.min(255, b + step));
        
        currentHex = rgbToHex(r, g, b);
        currentRatio = getContrastRatio(currentHex, bgHex);
        
        if (currentRatio >= targetRatio) break;
    }
    
    return currentHex;
}

export function getBestContrast(bgHex: string): string {
    const whiteContrast = getContrastRatio(bgHex, "#ffffff");
    const blackContrast = getContrastRatio(bgHex, "#000000");
    return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

export function getWCAGLevel(ratio: number): 'AAA' | 'AA' | 'Fail' {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'Fail';
}
