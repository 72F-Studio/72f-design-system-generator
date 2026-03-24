// src/plugin.ts - 72F Design System Generator v1.0
import { getBestContrast } from './utils/accessibility';

console.log("[72F] System Generator v1.0 active.");

function log(message: string, level: 'info' | 'error' | 'success' | 'system' = 'info') {
    penpot.ui.sendMessage({ type: 'log', message, level });
}

penpot.ui.open('72F Design System Generator', 'index.html', {
  width: 360,
  height: 600,
});

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string') return [0, 0, 0];
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

function mix(color1: string, color2: string, weight: number) {
    if (weight <= 0) return color1;
    if (weight >= 1) return color2;
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const r = r1 * (1 - weight) + r2 * weight;
    const g = g1 * (1 - weight) + g2 * weight;
    const b = b1 * (1 - weight) + b2 * weight;
    return rgbToHex(r, g, b);
}

const sanitize = (val: string) => val.toLowerCase().trim().replace(/[\/\\:\*\?"<>|]/g, '-').replace(/\s+/g, '-');

function broadcastData() {
    const tokensCatalog = (penpot.library.local as any).tokens;
    if (!tokensCatalog) return;
    penpot.ui.sendMessage({
        type: 'library-data',
        sets: tokensCatalog.sets.map((s: any) => ({ id: s.id, name: s.name })),
        themes: tokensCatalog.themes.map((t: any) => ({ id: t.id, name: t.name, group: t.group }))
    });
}

penpot.ui.onMessage<any>(async (msg) => {
    const tokensCatalog = (penpot.library.local as any).tokens;

    if (msg.type === 'UI_READY') {
        const allFonts = (penpot as any).fonts.all;
        if (allFonts) {
            const fontNames = Array.from(new Set(allFonts.map((f: any) => f.fontFamily))).sort();
            penpot.ui.sendMessage({ type: "available-fonts", data: fontNames });
        }
        broadcastData();
    }

    if (msg.type === 'GENERATE_SYSTEM') {
        const { preset, themeName, sets, layout } = msg as { 
            preset: any, 
            themeName: string,
            sets: { name: string, colors: any[], fonts: any }[],
            layout: { density: number }
        };
        
        log(`Generating Design System...`, 'system');

        const createdSets: any[] = [];
        let createdTheme: any = null;

        try {
            if (!tokensCatalog) throw new Error("Tokens API not supported.");
            const allFonts = (penpot as any).fonts.all || [];

            // ── 1. THEME INITIALIZATION ──────────────────────────────────────
            createdTheme = tokensCatalog.themes.find((t: any) => t.group === preset.name && t.name === themeName);
            if (!createdTheme) {
                createdTheme = tokensCatalog.addTheme({ group: preset.name, name: themeName });
            }
            if (!createdTheme) throw new Error("Failed to initialize Theme.");

            // ── 2. PRIMITIVES SET ────────────────────────────────────────────
            const primitivesName = `${preset.name} - Primitives`.replace(/\//g, '-').trim();
            let primitivesSet = tokensCatalog.sets.find((s: any) => s.name === primitivesName);
            if (!primitivesSet) {
                primitivesSet = tokensCatalog.addSet({ name: primitivesName });
                if (primitivesSet) createdSets.push(primitivesSet);
            }
            
            if (!primitivesSet) throw new Error("Failed to initialize Primitives Set.");

            // Bind immediately using the Live Proxy
            try { createdTheme.addSet(primitivesSet); } catch(e) {}

            log("Populating Scales...", "info");
            // Fill primitives...
            preset.radii.forEach((r: any) => {
                const val = Math.round(r.value * layout.density);
                primitivesSet.addToken({ type: 'borderRadius', name: `radius.${sanitize(r.name)}`, value: `${val}px` });
            });
            preset.spacing.forEach((s: number, i: number) => {
                const val = Math.round(s * layout.density);
                primitivesSet.addToken({ type: 'spacing', name: `spacing.${i}`, value: `${val}px` });
            });
            preset.defaults.colors.forEach((color: any) => {
                const nameLow = sanitize(color.name);
                const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
                steps.forEach((step, i) => {
                    const weight = i / (steps.length - 1);
                    let val: string;
                    if (weight < 0.5) val = mix(color.hex, "#ffffff", (0.5 - weight) * 2 * 0.9);
                    else if (weight === 0.5) val = color.hex;
                    else val = mix(color.hex, "#000000", (weight - 0.5) * 2 * 0.8);
                    primitivesSet.addToken({ type: 'color', name: `primitive.${nameLow}.${step}`, value: val });
                });
            });
            preset.shadows.forEach((sh: any) => {
                primitivesSet.addToken({ type: 'shadow', name: `shadow.${sanitize(sh.name)}`, value: [{
                    inset: false, 
                    offsetX: `${Math.round(sh.x * layout.density)}px`, 
                    offsetY: `${Math.round(sh.y * layout.density)}px`, 
                    blur: `${Math.round(sh.blur * layout.density)}px`, 
                    spread: `${Math.max(0, Math.round(sh.spread * layout.density))}px`, 
                    color: "rgba(0,0,0,0.1)",
                }]});
            });

            // ── 3. SEMANTIC SET GENERATION ───────────────────────────────────
            for (const setData of sets) {
                const fullSetName = `${preset.name} - ${setData.name}`.replace(/\//g, '-').trim();
                let tokenSet = tokensCatalog.sets.find((s: any) => s.name === fullSetName);
                if (!tokenSet) {
                    tokenSet = tokensCatalog.addSet({ name: fullSetName });
                    if (tokenSet) createdSets.push(tokenSet);
                }
                if (!tokenSet) continue;

                // Bind immediately using the Live Proxy
                try { createdTheme.addSet(tokenSet); } catch(e) {}

                setData.colors.forEach((c: any) => {
                    tokenSet.addToken({ type: 'color', name: `semantic.${sanitize(c.name)}`, value: c.hex });
                    tokenSet.addToken({ type: 'color', name: `semantic.on-${sanitize(c.name)}`, value: getBestContrast(c.hex) });
                });

                const categories = ['heading', 'body', 'mono', 'ui'];
                categories.forEach(cat => {
                    let families = setData.fonts[cat] || setData.fonts['body'] || ["Inter"];
                    if (!Array.isArray(families)) families = [families];

                    let roles = preset.typography.roles.filter((r: any) => r.category === cat);
                    if (roles.length === 0 && (cat === 'mono' || cat === 'ui')) roles = preset.typography.roles.filter((r: any) => r.category === 'body');

                    families.forEach((family: string) => {
                        const font = allFonts.find((f: any) => f.fontFamily === family);
                        if (!font) return;
                        roles.forEach((role: any) => {
                            const variant = font.variants.find((v: any) => String(v.fontWeight) === role.weight) || font.variants[0];
                            tokenSet.addToken({
                                type: 'typography',
                                name: `type.${sanitize(family)}.${sanitize(role.name).replace(/\//g, '.')}`,
                                value: { fontFamilies: [font.fontFamily], fontWeight: String(variant.fontWeight), fontSize: `${role.size}px`, lineHeight: "1.5" }
                            });
                        });
                    });
                });
            }

            log(`Deployment Complete: ${preset.name}`, 'success');
            broadcastData();

        } catch (e: any) {
            console.error("[72F Error]", e);
            log(`CRITICAL ERROR: ${e.message}`, 'error');
            createdSets.forEach(s => { try { s.remove(); } catch(err){} });
            if (createdTheme) try { createdTheme.remove(); } catch(err){}
        }
    }

    if (msg.type === 'DELETE_SET') {
        const set = tokensCatalog.getSetById(msg.id);
        if (set) { set.remove(); broadcastData(); log(`Set deleted.`, 'info'); }
    }

    if (msg.type === 'DELETE_THEME') {
        const theme = tokensCatalog.themes.find((t: any) => t.id === msg.id);
        if (theme) { theme.remove(); broadcastData(); log(`Theme deleted.`, 'info'); }
    }
});
