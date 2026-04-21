import React, { useState, useEffect } from 'react';
import { PRESETS } from '../presets/data';
import type { Preset, ColorRole, FontFamily, TokenGroup } from '../presets/types';
import { ChevronDown, Zap, RefreshCw, Trash2, Plus } from 'lucide-react';

const DENSITY_LABELS: Record<string, string> = {
    '0.75': 'Compact',
    '1.0':  'Default',
    '1.25': 'Comfortable',
    '1.5':  'Spacious',
};

const CATEGORIES = [
    { id: 'all',        label: 'All' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'modern',     label: 'Modern' },
    { id: 'web',        label: 'Web' },
    { id: 'mobile',     label: 'Mobile' },
] as const;

const COLOR_ROLES: ColorRole[] = ['primary','secondary','tertiary','neutral','success','warning','error','info'];
const FONT_FAMILIES: FontFamily[] = ['heading','body','mono'];
const FONT_WEIGHTS = ['100','200','300','400','500','600','700','800','900'];

const ROLE_COLORS: Record<string, string> = {
    primary:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
    secondary: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    tertiary:  'bg-pink-500/20 text-pink-300 border-pink-500/30',
    neutral:   'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    success:   'bg-green-500/20 text-green-300 border-green-500/30',
    warning:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
    error:     'bg-red-500/20 text-red-300 border-red-500/30',
    info:      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

interface DraftColor {
    name: string;
    hex: string;
    role: ColorRole;
}

interface DraftTypeRole {
    path: string;
    size: number;
    weight: string;
    lineHeight: number;
    letterSpacing: string;
    family: FontFamily;
    group: TokenGroup;
}

interface Draft {
    fonts: { heading: string; body: string; mono: string; monoFallbacks: string[] };
    colors: DraftColor[];
    typeRoles: DraftTypeRole[];
}

// Normalize any color value to 6-digit hex for <input type="color">.
// Falls back to #6366f1 if unparseable (e.g. rgba values).
const toHex6 = (v: string): string => {
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
        const [, r, g, b] = v.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/)!;
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#6366f1';
};

const inputCls = 'bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-primary transition-all';

export default function GeneratorTab() {
    const [selectedPresetId, setSelectedPresetId] = useState('');
    const [preset, setPreset] = useState<Preset | null>(null);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [themeName, setThemeName] = useState('');
    const [density, setDensity] = useState('1.0');
    const [availableFonts, setAvailableFonts] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        const handleMsg = (e: MessageEvent) => {
            if (e.data.type === 'available-fonts') setAvailableFonts(e.data.data);
            if (e.data.type === 'log' && (e.data.level === 'success' || e.data.level === 'error')) {
                setIsDeploying(false);
            }
        };
        window.addEventListener('message', handleMsg);
        window.parent.postMessage({ type: 'UI_READY' }, '*');
        return () => window.removeEventListener('message', handleMsg);
    }, []);

    const onPresetChange = (id: string) => {
        const p = PRESETS.find(x => x.id === id);
        if (!p) return;
        setSelectedPresetId(id);
        setPreset(p);
        setThemeName(`${p.name} Theme`);
        setDraft({
            fonts:     { ...p.fonts },
            colors:    p.colors.map(c => ({ ...c })),
            typeRoles: p.typeRoles.map(r => ({ ...r })),
        });
    };

    // ── Draft helpers ────────────────────────────────────────────────────────
    const updateFont = (key: 'heading' | 'body' | 'mono', value: string) =>
        setDraft(d => d ? { ...d, fonts: { ...d.fonts, [key]: value } } : d);

    const updateColor = (i: number, field: keyof DraftColor, value: string) =>
        setDraft(d => d ? {
            ...d,
            colors: d.colors.map((c, idx) => idx === i ? { ...c, [field]: value } : c),
        } : d);

    const addColor = () =>
        setDraft(d => d ? {
            ...d,
            colors: [...d.colors, { name: 'New Color', hex: '#6366f1', role: 'primary' as ColorRole }],
        } : d);

    const removeColor = (i: number) =>
        setDraft(d => d ? { ...d, colors: d.colors.filter((_, idx) => idx !== i) } : d);

    const updateTypeRole = (i: number, field: keyof DraftTypeRole, value: string | number) =>
        setDraft(d => d ? {
            ...d,
            typeRoles: d.typeRoles.map((r, idx) => idx === i ? { ...r, [field]: value } : r),
        } : d);

    const addTypeRole = () =>
        setDraft(d => d ? {
            ...d,
            typeRoles: [...d.typeRoles, {
                path: 'body/new', size: 14, weight: '400',
                lineHeight: 1.5, letterSpacing: '0em',
                family: 'body' as FontFamily, group: 'body' as TokenGroup,
            }],
        } : d);

    const removeTypeRole = (i: number) =>
        setDraft(d => d ? { ...d, typeRoles: d.typeRoles.filter((_, idx) => idx !== i) } : d);

    const deploy = () => {
        if (!preset || !draft) return;
        setIsDeploying(true);
        window.parent.postMessage({
            type: 'GENERATE_SYSTEM',
            preset: { ...preset, fonts: draft.fonts, colors: draft.colors, typeRoles: draft.typeRoles },
            themeName: themeName || `${preset.name} Theme`,
            monoOverride: draft.fonts.mono,
            density: parseFloat(density),
        }, '*');
    };

    const filteredPresets = categoryFilter === 'all'
        ? PRESETS
        : PRESETS.filter(p => p.category === categoryFilter);

    return (
        <div className="space-y-8 pb-40 animate-in fade-in duration-500">

            {/* ── STEP 1: Foundation ─────────────────────────────────────── */}
            <section className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 px-1">
                    1 · Design Foundation
                </span>

                <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                categoryFilter === cat.id
                                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <select
                        value={selectedPresetId}
                        onChange={e => onPresetChange(e.target.value)}
                        className="w-full h-16 pl-5 pr-12 bg-zinc-900 border-2 border-zinc-800 rounded-[20px] text-[15px] font-bold text-zinc-100 appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
                    >
                        <option value="" disabled>Choose a system…</option>
                        {filteredPresets.map(p => (
                            <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                </div>

                {preset && (
                    <p className="text-[11px] text-zinc-500 px-1 leading-relaxed animate-in fade-in duration-300">
                        {preset.description}
                    </p>
                )}
            </section>

            {/* ── STEP 2: Configure ──────────────────────────────────────── */}
            {preset && draft && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 px-1">
                        2 · Configure
                    </span>

                    {/* Theme name */}
                    <input
                        type="text"
                        placeholder="Theme name"
                        value={themeName}
                        onChange={e => setThemeName(e.target.value)}
                        className="w-full h-12 px-5 bg-zinc-900 border-2 border-zinc-800 rounded-[16px] text-[14px] font-bold text-zinc-100 focus:outline-none focus:border-primary transition-all placeholder:text-zinc-700"
                    />

                    {/* Shared font datalist */}
                    <datalist id="font-list">
                        {availableFonts.map(f => <option key={f} value={f} />)}
                    </datalist>

                    {/* ── Fonts ─────────────────────────────────────────── */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Font System</span>
                        {(['heading', 'body', 'mono'] as const).map(key => (
                            <div key={key} className="flex items-center gap-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 w-14 shrink-0">{key}</span>
                                <input
                                    type="text"
                                    list="font-list"
                                    value={draft.fonts[key]}
                                    onChange={e => updateFont(key, e.target.value)}
                                    className={`flex-1 h-9 px-3 text-[12px] font-semibold ${inputCls}`}
                                    placeholder={`${key} font name`}
                                />
                            </div>
                        ))}
                        {availableFonts.length === 0 && (
                            <p className="text-[10px] text-zinc-600">Type any font name or open a Penpot file to load available fonts.</p>
                        )}
                    </div>

                    {/* ── Colors ────────────────────────────────────────── */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Color Palette · {draft.colors.length}
                        </span>

                        <div className="space-y-2">
                            {draft.colors.map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {/* Native color picker */}
                                    <input
                                        type="color"
                                        value={toHex6(c.hex)}
                                        onChange={e => updateColor(i, 'hex', e.target.value)}
                                        className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer p-0.5 bg-transparent shrink-0"
                                        title="Pick color"
                                    />
                                    {/* Hex text */}
                                    <input
                                        type="text"
                                        value={c.hex}
                                        onChange={e => updateColor(i, 'hex', e.target.value)}
                                        className={`w-[76px] h-8 px-2 text-[10px] font-mono shrink-0 ${inputCls}`}
                                        placeholder="#000000"
                                    />
                                    {/* Name */}
                                    <input
                                        type="text"
                                        value={c.name}
                                        onChange={e => updateColor(i, 'name', e.target.value)}
                                        className={`flex-1 min-w-0 h-8 px-2 text-[11px] font-semibold ${inputCls}`}
                                        placeholder="Name"
                                    />
                                    {/* Role */}
                                    <div className="relative shrink-0">
                                        <select
                                            value={c.role}
                                            onChange={e => updateColor(i, 'role', e.target.value)}
                                            className={`h-8 pl-2 pr-5 text-[10px] font-bold appearance-none cursor-pointer shrink-0 ${inputCls}`}
                                            style={{ width: '78px' }}
                                        >
                                            {COLOR_ROLES.map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={9} />
                                    </div>
                                    {/* Delete */}
                                    <button
                                        onClick={() => removeColor(i)}
                                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addColor}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-all"
                        >
                            <Plus size={12} /> Add Color
                        </button>
                    </div>

                    {/* ── Type Scale ────────────────────────────────────── */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Type Scale · {draft.typeRoles.length} roles
                        </span>

                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-0.5">
                            {draft.typeRoles.map((r, i) => (
                                <div key={i} className="space-y-1.5 bg-black/30 rounded-xl p-2.5 border border-zinc-800/50">
                                    {/* Row 1: path prefix + path input + delete */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-mono text-zinc-600 shrink-0">type/</span>
                                        <input
                                            type="text"
                                            value={r.path}
                                            onChange={e => updateTypeRole(i, 'path', e.target.value)}
                                            className={`flex-1 h-7 px-2 text-[11px] font-mono ${inputCls}`}
                                            placeholder="body/md"
                                        />
                                        <button
                                            onClick={() => removeTypeRole(i)}
                                            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                    {/* Row 2: size · weight · family · lineHeight · letterSpacing */}
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={r.size}
                                            onChange={e => updateTypeRole(i, 'size', parseInt(e.target.value) || 14)}
                                            className={`w-11 h-6 px-1 text-[10px] font-mono text-center ${inputCls}`}
                                            title="Size px"
                                            min={6} max={200}
                                        />
                                        <div className="relative">
                                            <select
                                                value={r.weight}
                                                onChange={e => updateTypeRole(i, 'weight', e.target.value)}
                                                className={`h-6 pl-1.5 pr-4 text-[10px] font-mono appearance-none cursor-pointer ${inputCls}`}
                                                style={{ width: '52px' }}
                                                title="Weight"
                                            >
                                                {FONT_WEIGHTS.map(w => (
                                                    <option key={w} value={w}>{w}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={8} />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={r.family}
                                                onChange={e => updateTypeRole(i, 'family', e.target.value as FontFamily)}
                                                className={`h-6 pl-1.5 pr-4 text-[10px] font-mono appearance-none cursor-pointer ${inputCls}`}
                                                style={{ width: '60px' }}
                                                title="Font family"
                                            >
                                                {FONT_FAMILIES.map(f => (
                                                    <option key={f} value={f}>{f}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={8} />
                                        </div>
                                        <input
                                            type="number"
                                            value={r.lineHeight}
                                            onChange={e => updateTypeRole(i, 'lineHeight', parseFloat(e.target.value) || 1.5)}
                                            className={`w-12 h-6 px-1 text-[10px] font-mono text-center ${inputCls}`}
                                            title="Line height"
                                            step={0.05} min={0.5} max={4}
                                        />
                                        <input
                                            type="text"
                                            value={r.letterSpacing}
                                            onChange={e => updateTypeRole(i, 'letterSpacing', e.target.value)}
                                            className={`flex-1 min-w-0 h-6 px-1.5 text-[10px] font-mono ${inputCls}`}
                                            title="Letter spacing"
                                            placeholder="0em"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addTypeRole}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-all"
                        >
                            <Plus size={12} /> Add Role
                        </button>
                    </div>

                    {/* ── Density ───────────────────────────────────────── */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Density</span>
                            <span className="text-[11px] font-black text-primary">{DENSITY_LABELS[density] ?? `${density}×`}</span>
                        </div>
                        <input
                            type="range"
                            min="0.75" max="1.5" step="0.25"
                            value={density}
                            onChange={e => setDensity(e.target.value)}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[9px] text-zinc-700 font-black uppercase tracking-widest">
                            <span>Compact</span><span>Default</span><span>Comfortable</span><span>Spacious</span>
                        </div>
                    </div>
                </section>
            )}

            {/* ── STEP 3: Deploy ─────────────────────────────────────────── */}
            <button
                onClick={deploy}
                disabled={!preset || !draft || isDeploying}
                className={`w-full h-16 rounded-[20px] font-black text-[13px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    !preset
                        ? 'bg-zinc-900 border-2 border-dashed border-zinc-800 text-zinc-700 cursor-not-allowed'
                        : isDeploying
                        ? 'bg-primary/20 border-2 border-primary/40 text-primary/60 cursor-wait'
                        : 'bg-primary border-2 border-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02] hover:shadow-primary/50 active:scale-[0.99]'
                }`}
            >
                {isDeploying
                    ? <><RefreshCw size={18} className="animate-spin" /> Deploying…</>
                    : <><Zap size={18} /> Deploy System</>
                }
            </button>

            {preset && draft && (
                <p className="text-center text-[10px] text-zinc-600 -mt-4">
                    4 token sets · {draft.colors.length} color palettes · {draft.typeRoles.length} type roles
                </p>
            )}
        </div>
    );
}
