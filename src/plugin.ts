// src/plugin.ts — 72F Design System Generator v2.0
import { getBestContrast } from './utils/accessibility';
import { generateColorScale, findClosestStep } from './utils/colorScale';
import type { Preset, ColorRole } from './presets/types';

console.log('[72F] Generator v2.0 active.');

penpot.ui.open('72F Design System Generator', 'index.html', { width: 920, height: 680 });

// ── UTILITIES ─────────────────────────────────────────────────────────────────

function log(msg: string, level: 'info' | 'error' | 'success' | 'system' = 'info') {
    penpot.ui.sendMessage({ type: 'log', message: msg, level });
}

/** Dot-separated path segment: lowercased, slashes → dots, special-chars stripped. */
const san = (v: string) =>
    v.toLowerCase().trim().replace(/[\/\\:\*\?"<>|]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');

/** Convert a slash-separated path to a dot-separated Penpot token name. */
const dotPath = (v: string) => v.replace(/\//g, '.');

/** Defer to let the Penpot CLJS engine resolve between write batches. */
const defer = <T>(fn: () => T): Promise<T> =>
    new Promise(r => setTimeout(() => r(fn()), 0));

function broadcastData() {
    const tc = (penpot.library.local as any).tokens;
    if (!tc) return;
    penpot.ui.sendMessage({
        type: 'library-data',
        sets: tc.sets.map((s: any) => ({ id: s.id, name: s.name })),
        themes: tc.themes.map((t: any) => ({ id: t.id, name: t.name, group: t.group })),
    });
}

/** Resolve mono font: check available fonts, walk fallback chain. */
function resolveMonoFont(preferred: string, fallbacks: string[], availableFonts: any[]): string {
    const names = [preferred, ...fallbacks];
    for (const name of names) {
        if (availableFonts.some((f: any) => f.fontFamily === name)) return name;
    }
    return preferred; // return original even if unavailable — user can fix in Penpot
}

// ── SEMANTIC COLOR SYSTEM ─────────────────────────────────────────────────────

/**
 * Returns semantic token definitions for a given mode.
 * Values are token references ({primitive.color....}) where possible.
 */
function buildSemanticColors(
    preset: Preset,
    mode: 'light' | 'dark',
    scales: Record<string, Record<string, string>>
): Array<{ name: string; value: string }> {
    const isDark = mode === 'dark';
    const get = (role: ColorRole) => preset.colors.find(c => c.role === role);

    const neutral   = get('neutral');
    const primary   = get('primary');
    const secondary = get('secondary');
    const success   = get('success');
    const warning   = get('warning');
    const error     = get('error');
    const info      = get('info');

    // Resolve to actual hex — cross-set references ({...} syntax) fail during
    // addToken because style-dictionary can't resolve them without active sets.
    const ref = (colorName: string, step: string) =>
        scales[san(colorName)]?.[step as keyof typeof scales[string]] ?? '#000000';

    const tokens: Array<{ name: string; value: string }> = [];
    const add = (name: string, value: string) => tokens.push({ name, value });

    // Background hierarchy
    if (neutral) {
        add('color.bg.canvas',     isDark ? ref(neutral.name, '950') : '#ffffff');
        add('color.bg.default',    ref(neutral.name, isDark ? '900' : '50'));
        add('color.bg.subtle',     ref(neutral.name, isDark ? '800' : '100'));
        add('color.bg.elevated',   isDark ? ref(neutral.name, '800') : '#ffffff');
        add('color.bg.overlay',    isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)');
    }

    // Foreground hierarchy
    if (neutral) {
        add('color.fg.default',    ref(neutral.name, isDark ? '50'  : '900'));
        add('color.fg.muted',      ref(neutral.name, isDark ? '300' : '600'));
        add('color.fg.subtle',     ref(neutral.name, isDark ? '500' : '400'));
        add('color.fg.disabled',   ref(neutral.name, isDark ? '700' : '300'));
        add('color.fg.inverse',    ref(neutral.name, isDark ? '900' : '50'));
        add('color.fg.on-canvas',  isDark ? ref(neutral.name, '100') : ref(neutral.name, '800'));
    }

    // Border
    if (neutral) {
        add('color.border.subtle',  ref(neutral.name, isDark ? '800' : '100'));
        add('color.border.default', ref(neutral.name, isDark ? '700' : '200'));
        add('color.border.strong',  ref(neutral.name, isDark ? '500' : '400'));
    }

    // Focus ring (uses primary if available, else neutral)
    const focusRef = primary
        ? ref(primary.name, isDark ? '400' : '500')
        : neutral ? ref(neutral.name, isDark ? '400' : '500') : '#000000';
    add('color.border.focus', focusRef);

    // Brand / primary
    if (primary) {
        add('color.brand.primary',        ref(primary.name, isDark ? '400' : '600'));
        add('color.brand.primary-hover',  ref(primary.name, isDark ? '300' : '700'));
        add('color.brand.primary-active', ref(primary.name, isDark ? '200' : '800'));
        add('color.brand.primary-subtle', ref(primary.name, isDark ? '900' : '100'));
        add('color.brand.primary-border', ref(primary.name, isDark ? '600' : '300'));
        add('color.brand.on-primary',     getBestContrast(
            scales[san(primary.name)]?.[isDark ? '400' : '600'] ?? primary.hex
        ));
    }

    // Secondary brand
    if (secondary) {
        add('color.brand.secondary',        ref(secondary.name, isDark ? '400' : '600'));
        add('color.brand.secondary-subtle', ref(secondary.name, isDark ? '900' : '100'));
        add('color.brand.on-secondary',     getBestContrast(
            scales[san(secondary.name)]?.[isDark ? '400' : '600'] ?? secondary.hex
        ));
    }

    // Status: success
    if (success) {
        add('color.status.success',        ref(success.name, isDark ? '400' : '600'));
        add('color.status.success-subtle', ref(success.name, isDark ? '900' : '100'));
        add('color.status.on-success',     getBestContrast(
            scales[san(success.name)]?.[isDark ? '400' : '600'] ?? success.hex
        ));
    }

    // Status: warning
    if (warning) {
        add('color.status.warning',        ref(warning.name, isDark ? '400' : '600'));
        add('color.status.warning-subtle', ref(warning.name, isDark ? '900' : '100'));
        add('color.status.on-warning',     getBestContrast(
            scales[san(warning.name)]?.[isDark ? '400' : '600'] ?? warning.hex
        ));
    }

    // Status: error
    if (error) {
        add('color.status.error',        ref(error.name, isDark ? '400' : '600'));
        add('color.status.error-subtle', ref(error.name, isDark ? '900' : '100'));
        add('color.status.on-error',     getBestContrast(
            scales[san(error.name)]?.[isDark ? '400' : '600'] ?? error.hex
        ));
    }

    // Status: info
    if (info) {
        add('color.status.info',        ref(info.name, isDark ? '400' : '600'));
        add('color.status.info-subtle', ref(info.name, isDark ? '900' : '100'));
        add('color.status.on-info',     getBestContrast(
            scales[san(info.name)]?.[isDark ? '400' : '600'] ?? info.hex
        ));
    }

    return tokens;
}

// ── MAIN GENERATOR ────────────────────────────────────────────────────────────

async function generateSystem(
    msg: any,
    createdSets: any[],
    created: { theme: any }
) {
    const { preset, themeName, monoOverride, density = 1 } = msg as {
        preset: Preset;
        themeName: string;
        monoOverride?: string;
        density: number;
    };

    const tc = (penpot.library.local as any).tokens;
    if (!tc) throw new Error('Tokens API not available in this Penpot version.');

    const allFonts: any[] = (penpot as any).fonts?.all ?? [];
    const d = Math.max(0.5, Math.min(2, density));

    log(`Initializing "${preset.name}"…`, 'system');

    // ── THEME ────────────────────────────────────────────────────────────────
    created.theme = tc.themes.find(
        (t: any) => t.group === preset.name && t.name === themeName
    ) ?? tc.addTheme({ group: preset.name, name: themeName });
    if (!created.theme) throw new Error('Failed to create theme.');

    // Resolve mono font against available fonts
    const monoFont = monoOverride
        ? monoOverride
        : resolveMonoFont(preset.fonts.mono, preset.fonts.monoFallbacks, allFonts);

    // Pre-compute all color scales (used in both primitives + semantic sets)
    const scales: Record<string, Record<string, string>> = {};
    for (const c of preset.colors) {
        scales[san(c.name)] = generateColorScale(c.hex);
    }

    // ── SET FACTORY ──────────────────────────────────────────────────────────
    /**
     * setCache stores the proxy returned directly by tc.addSet() for new sets.
     * For sets that already exist, tc.sets.find() returns a plain object (not a
     * live proxy), so theme.addSet() will fail for those — that's acceptable on
     * re-runs since the theme from the previous run already has the sets linked.
     */
    const setCache = new Map<string, any>();

    const getOrCreateSet = (name: string) => {
        if (setCache.has(name)) return setCache.get(name);
        const alreadyExists = tc.sets.some((x: any) => x.name === name);
        // For NEW sets, tc.addSet() returns a real live proxy.
        // For existing sets, tc.sets.find() returns a plain object (not a proxy).
        const s = alreadyExists
            ? tc.sets.find((x: any) => x.name === name)
            : tc.addSet({ name });
        if (s) {
            setCache.set(name, s);
            if (!createdSets.includes(s)) createdSets.push(s);
        }
        return s;
    };

    /** Attach a set to the theme. Only works when s is a live proxy (new sets). */
    const attachToTheme = (theme: any, name: string) => {
        const s = setCache.get(name);
        if (s) try { theme.addSet(s); } catch (_) {}
    };

    // ── 1. PRIMITIVES SET ────────────────────────────────────────────────────
    const primName = san(`${preset.name} - Primitives`);
    const prim = getOrCreateSet(primName);
    if (!prim) throw new Error('Failed to create primitives set.');
    attachToTheme(created.theme, primName);

    // Color palettes (11-step HSL scales per color)
    log('Building color scales…', 'info');
    await defer(() => {
        for (const c of preset.colors) {
            const cName = san(c.name);
            for (const [step, hex] of Object.entries(scales[cName])) {
                prim.addToken({ type: 'color', name: `primitive.color.${cName}.${step}`, value: hex });
            }
        }
        prim.addToken({ type: 'color', name: 'primitive.color.white',       value: '#ffffff' });
        prim.addToken({ type: 'color', name: 'primitive.color.black',       value: '#000000' });
        prim.addToken({ type: 'color', name: 'primitive.color.transparent', value: 'rgba(0,0,0,0)' });
    });

    // Font families
    log('Building typography primitives…', 'info');
    await defer(() => {
        // Use 'string' type — 'fontFamilies' causes Penpot's bridge to wrap the
        // value in an array which then breaks style-dictionary CSS generation.
        prim.addToken({ type: 'string', name: 'primitive.font.heading', value: preset.fonts.heading });
        prim.addToken({ type: 'string', name: 'primitive.font.body',    value: preset.fonts.body });
        prim.addToken({ type: 'string', name: 'primitive.font.mono',    value: monoFont });
    });

    // Font sizes — consistent named scale
    await defer(() => {
        const sizes: [string, number][] = [
            ['2xs', 10], ['xs', 12], ['sm', 14], ['base', 16],
            ['md', 18], ['lg', 20], ['xl', 24], ['2xl', 28],
            ['3xl', 32], ['4xl', 36], ['5xl', 48], ['6xl', 60], ['7xl', 72],
        ];
        for (const [name, px] of sizes) {
            prim.addToken({ type: 'fontSizes', name: `primitive.size.${name}`, value: `${Math.round(px * d)}px` });
        }
    });

    // Font weights — full named scale
    await defer(() => {
        const weights: [string, number][] = [
            ['thin', 100], ['extralight', 200], ['light', 300], ['regular', 400],
            ['medium', 500], ['semibold', 600], ['bold', 700], ['extrabold', 800], ['black', 900],
        ];
        for (const [name, val] of weights) {
            prim.addToken({ type: 'fontWeights', name: `primitive.weight.${name}`, value: String(val) });
        }
    });

    // Line heights — named scale
    await defer(() => {
        const lhs: [string, number][] = [
            ['none', 1], ['tighter', 1.1], ['tight', 1.25], ['snug', 1.375],
            ['normal', 1.5], ['relaxed', 1.625], ['loose', 2],
        ];
        for (const [name, val] of lhs) {
            prim.addToken({ type: 'number', name: `primitive.leading.${name}`, value: String(val) });
        }
    });

    // Letter spacing — named scale
    await defer(() => {
        const ls: [string, string][] = [
            ['tightest', '-0.05em'], ['tighter', '-0.025em'], ['tight', '-0.01em'],
            ['normal', '0em'], ['wide', '0.01em'], ['wider', '0.025em'], ['widest', '0.1em'],
        ];
        for (const [name, val] of ls) {
            prim.addToken({ type: 'letterSpacing', name: `primitive.tracking.${name}`, value: val });
        }
    });

    // Paragraph spacing
    await defer(() => {
        const ps: [string, number][] = [
            ['none', 0], ['tight', 4], ['normal', 16], ['relaxed', 24], ['loose', 32],
        ];
        for (const [name, px] of ps) {
            prim.addToken({ type: 'spacing', name: `primitive.paragraph.${name}`, value: `${Math.round(px * d)}px` });
        }
    });

    // Text decoration
    await defer(() => {
        prim.addToken({ type: 'textDecoration', name: 'primitive.decoration.none',         value: 'none' });
        prim.addToken({ type: 'textDecoration', name: 'primitive.decoration.underline',     value: 'underline' });
        prim.addToken({ type: 'textDecoration', name: 'primitive.decoration.line-through',  value: 'line-through' });
    });

    // Text case
    await defer(() => {
        prim.addToken({ type: 'textCase', name: 'primitive.case.none',       value: 'none' });
        prim.addToken({ type: 'textCase', name: 'primitive.case.upper',      value: 'uppercase' });
        prim.addToken({ type: 'textCase', name: 'primitive.case.lower',      value: 'lowercase' });
        prim.addToken({ type: 'textCase', name: 'primitive.case.title',      value: 'capitalize' });
    });

    // Spacing scale
    log('Building spacing & layout primitives…', 'info');
    await defer(() => {
        const spacingLabels = ['0','1','2','3','4','5','6','7','8','9','10','11','12'];
        preset.spacing.forEach((px, i) => {
            const label = spacingLabels[i] ?? String(i);
            prim.addToken({ type: 'spacing', name: `primitive.space.${label}`, value: `${Math.round(px * d)}px` });
        });
    });

    // Border radii
    await defer(() => {
        for (const r of preset.radii) {
            const val = r.value >= 9999 ? 9999 : Math.round(r.value * d);
            prim.addToken({ type: 'borderRadius', name: `primitive.radius.${san(r.name)}`, value: `${val}px` });
        }
    });

    // Border widths
    await defer(() => {
        const bws: [string, number][] = [['0', 0], ['1', 1], ['2', 2], ['4', 4]];
        for (const [name, px] of bws) {
            prim.addToken({ type: 'borderWidth', name: `primitive.stroke.${name}`, value: `${px}px` });
        }
    });

    // Opacity scale
    await defer(() => {
        const ops: [string, number][] = [
            ['0', 0], ['5', 0.05], ['10', 0.1], ['15', 0.15], ['20', 0.2],
            ['25', 0.25], ['30', 0.3], ['40', 0.4], ['50', 0.5],
            ['60', 0.6], ['70', 0.7], ['75', 0.75], ['80', 0.8],
            ['90', 0.9], ['95', 0.95], ['100', 1],
        ];
        for (const [name, val] of ops) {
            prim.addToken({ type: 'opacity', name: `primitive.opacity.${name}`, value: String(val) });
        }
    });

    // Shadows
    log('Building shadow primitives…', 'info');
    await defer(() => {
        for (const sh of preset.shadows) {
            prim.addToken({
                type: 'shadow',
                name: `primitive.shadow.${san(sh.name)}`,
                value: [{
                    inset: sh.inset ?? false,
                    offsetX: `${Math.round(sh.x * d)}px`,
                    offsetY: `${Math.round(sh.y * d)}px`,
                    blur:    `${Math.round(sh.blur * d)}px`,
                    spread:  `${Math.max(0, Math.round((sh.spread ?? 0) * d))}px`,
                    color:   `rgba(0,0,0,${sh.opacity})`,
                }],
            });
        }
        // Standard inset shadow
        prim.addToken({
            type: 'shadow',
            name: 'primitive.shadow.inset',
            value: [{ inset: true, offsetX: '0px', offsetY: '2px', blur: '4px', spread: '0px', color: 'rgba(0,0,0,0.06)' }],
        });
    });

    // Dimensions — icon sizes + breakpoints
    await defer(() => {
        const icons: [string, number][] = [
            ['xs', 12], ['sm', 16], ['md', 20], ['lg', 24], ['xl', 32], ['2xl', 40], ['3xl', 48],
        ];
        for (const [name, px] of icons) {
            prim.addToken({ type: 'dimension', name: `primitive.icon.${name}`, value: `${Math.round(px * d)}px` });
        }
        // Breakpoints (not scaled by density — they're layout breakpoints)
        const bps: [string, number][] = [
            ['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280], ['2xl', 1536],
        ];
        for (const [name, px] of bps) {
            prim.addToken({ type: 'dimension', name: `primitive.screen.${name}`, value: `${px}px` });
        }
        // Z-index scale
        const zs: [string, number][] = [
            ['base', 0], ['raised', 10], ['dropdown', 100],
            ['sticky', 200], ['modal', 300], ['popover', 400], ['toast', 500],
        ];
        for (const [name, val] of zs) {
            prim.addToken({ type: 'number', name: `primitive.z.${name}`, value: String(val) });
        }
    });

    log('Primitives complete.', 'success');

    // ── 2. LIGHT SEMANTIC SET ────────────────────────────────────────────────
    const lightName = san(`${preset.name} - Light`);
    const lightSet = getOrCreateSet(lightName);
    if (lightSet) {
        attachToTheme(created.theme, lightName);
        log('Building light semantic tokens…', 'info');

        const lightColors = buildSemanticColors(preset, 'light', scales);
        await defer(() => {
            for (const { name, value } of lightColors) {
                lightSet.addToken({ type: 'color', name: `semantic.${name}`, value });
            }
        });
    }

    // ── 3. DARK SEMANTIC SET ─────────────────────────────────────────────────
    const darkName = san(`${preset.name} - Dark`);
    const darkSet = getOrCreateSet(darkName);
    if (darkSet) {
        attachToTheme(created.theme, darkName);
        log('Building dark semantic tokens…', 'info');

        const darkColors = buildSemanticColors(preset, 'dark', scales);
        await defer(() => {
            for (const { name, value } of darkColors) {
                darkSet.addToken({ type: 'color', name: `semantic.${name}`, value });
            }
        });
    }

    // ── 4. TYPOGRAPHY SET ─────────────────────────────────────────────────────
    // Typography is mode-independent; one shared set for all themes.
    const typeName = san(`${preset.name} - Typography`);
    const typeSet = getOrCreateSet(typeName);
    if (typeSet) {
        attachToTheme(created.theme, typeName);
        log('Building typography tokens…', 'info');

        // Resolve font objects for variant lookup
        const headingFont = allFonts.find((f: any) => f.fontFamily === preset.fonts.heading);
        const bodyFont    = allFonts.find((f: any) => f.fontFamily === preset.fonts.body);
        const monoFontObj = allFonts.find((f: any) => f.fontFamily === monoFont);

        await defer(() => {
            for (const role of preset.typeRoles) {
                const fontObj = role.family === 'heading'
                    ? (headingFont ?? bodyFont)
                    : role.family === 'mono'
                    ? (monoFontObj ?? bodyFont)
                    : bodyFont;

                const actualFamily = fontObj?.fontFamily
                    ?? (role.family === 'heading' ? preset.fonts.heading
                      : role.family === 'mono' ? monoFont
                      : preset.fonts.body);

                // Find matching variant or closest weight
                const variant = fontObj?.variants?.find(
                    (v: any) => String(v.fontWeight) === String(role.weight)
                ) ?? fontObj?.variants?.[0];

                const scaledSize = Math.round(role.size * d);

                typeSet.addToken({
                    type: 'typography',
                    name: `type.${dotPath(role.path)}`,
                    value: {
                        // Penpot schema: font-family must be [:vector string]
                        fontFamily:    [actualFamily],
                        fontWeight:    String(variant?.fontWeight ?? role.weight),
                        fontSize:      `${scaledSize}px`,
                        lineHeight:    String(role.lineHeight),
                        letterSpacing: role.letterSpacing,
                    },
                });
            }
        });
    }

    log(`"${preset.name}" deployment complete.`, 'success');
    broadcastData();
}

// ── MESSAGE HANDLER ───────────────────────────────────────────────────────────

penpot.ui.onMessage<any>(async (msg) => {
    const tc = (penpot.library.local as any).tokens;

    if (msg.type === 'UI_READY') {
        const allFonts = (penpot as any).fonts?.all;
        if (allFonts) {
            const fontNames = Array.from(new Set(
                (allFonts as any[]).map((f: any) => f.fontFamily)
            )).sort();
            penpot.ui.sendMessage({ type: 'available-fonts', data: fontNames });
        }
        broadcastData();
        return;
    }

    if (msg.type === 'GENERATE_SYSTEM') {
        const createdSets: any[] = [];
        const created = { theme: null as any };
        try {
            await generateSystem(msg, createdSets, created);
        } catch (e: any) {
            console.error('[72F Error]', e);
            log(`Error: ${e.message}`, 'error');
            createdSets.forEach(s => { try { s.remove(); } catch (_) {} });
            if (created.theme) try { created.theme.remove(); } catch (_) {}
        }
        return;
    }

    if (msg.type === 'REQUEST_TOKENS') {
        if (!tc) {
            penpot.ui.sendMessage({ type: 'export-error', message: 'Tokens API not available.' });
            return;
        }
        try {
            const tokens: any[] = [];
            tc.sets.forEach((set: any) => {
                (set.tokens ?? []).forEach((token: any) => {
                    tokens.push({ name: token.name, type: token.type, value: token.value });
                });
            });
            penpot.ui.sendMessage({ type: 'export-tokens', tokens });
        } catch (e: any) {
            penpot.ui.sendMessage({ type: 'export-error', message: e.message });
        }
        return;
    }

    if (msg.type === 'DELETE_SET') {
        if (!tc) return;
        const s = tc.getSetById?.(msg.id) ?? tc.sets.find((x: any) => x.id === msg.id);
        if (s) { s.remove(); broadcastData(); log('Set deleted.', 'info'); }
        return;
    }

    if (msg.type === 'DELETE_THEME') {
        if (!tc) return;
        const t = tc.themes.find((x: any) => x.id === msg.id);
        if (t) { t.remove(); broadcastData(); log('Theme deleted.', 'info'); }
        return;
    }
});
