import React, { useState, useEffect } from "react";
import { FileCode, FileJson, Copy, Download, Check, AlertCircle } from "lucide-react";

interface TokenEntry {
    name: string;
    type: string;
    value: any;
}

// ── Penpot → CSS var name  ────────────────────────────────────────────────────
// "primitive/primary/500" → "--primitive-primary-500"
function toCssVarName(name: string): string {
    return '--' + name.replace(/\//g, '-').replace(/[^a-zA-Z0-9-_]/g, '-');
}

// ── Resolve a token value to a raw CSS string ─────────────────────────────────
function resolveValue(value: any, allTokens: TokenEntry[]): string {
    if (typeof value === 'string') {
        // Token reference: {primitive/primary/500}
        const refMatch = value.match(/^\{(.+)\}$/);
        if (refMatch) {
            const ref = refMatch[1];
            const found = allTokens.find(t => t.name === ref);
            if (found) return `var(${toCssVarName(ref)})`;
        }
        return value;
    }
    if (typeof value === 'object' && value !== null) {
        // Shadow token
        if (Array.isArray(value) && value[0]?.offsetX !== undefined) {
            return value.map((s: any) =>
                `${s.inset ? 'inset ' : ''}${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`
            ).join(', ');
        }
        // Typography token
        if (value.fontFamilies) {
            return Array.isArray(value.fontFamilies) ? value.fontFamilies[0] : value.fontFamilies;
        }
    }
    return String(value);
}

// ── Generate :root CSS variables ─────────────────────────────────────────────
function generateCssVars(tokens: TokenEntry[]): string {
    if (tokens.length === 0) return '/* No tokens found. Generate a design system first. */';

    const lines: string[] = [':root {'];
    tokens.forEach(token => {
        const varName = toCssVarName(token.name);
        const val = resolveValue(token.value, tokens);
        lines.push(`  ${varName}: ${val};`);
    });
    lines.push('}');
    return lines.join('\n');
}

// ── Generate DTCG-compliant JSON ──────────────────────────────────────────────
function generateDtcgJson(tokens: TokenEntry[]): string {
    // Build nested object from slash-separated paths
    const root: any = {};

    tokens.forEach(token => {
        const parts = token.name.split('/');
        let node = root;
        parts.forEach((part, i) => {
            if (i === parts.length - 1) {
                node[part] = {
                    $value: token.value,
                    $type: token.type,
                };
            } else {
                node[part] = node[part] || {};
                node = node[part];
            }
        });
    });

    return JSON.stringify(root, null, 2);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExportTab() {
    const [tokens, setTokens] = useState<TokenEntry[]>([]);
    const [copiedCss, setCopiedCss] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleMsg = (e: MessageEvent) => {
            if (e.data.type === 'export-tokens') {
                setTokens(e.data.tokens || []);
                setError('');
            }
            if (e.data.type === 'export-error') {
                setError(e.data.message);
            }
        };
        window.addEventListener('message', handleMsg);
        return () => window.removeEventListener('message', handleMsg);
    }, []);

    const requestTokens = () => {
        window.parent.postMessage({ type: 'REQUEST_TOKENS' }, '*');
    };

    const copyCss = async () => {
        try {
            await navigator.clipboard.writeText(generateCssVars(tokens));
            setCopiedCss(true);
            setTimeout(() => setCopiedCss(false), 2000);
        } catch (_) {}
    };

    const downloadJson = () => {
        const blob = new Blob([generateDtcgJson(tokens)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '72f-tokens.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const hasTokens = tokens.length > 0;

    return (
        <div className="space-y-8 pb-40 animate-in fade-in duration-500">
            <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Developer Handoff</h2>

                {/* Load Tokens Button */}
                <button
                    onClick={requestTokens}
                    className="w-full py-4 bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-black text-[11px] uppercase tracking-widest rounded-[20px] transition-all"
                >
                    {hasTokens ? `${tokens.length} tokens loaded — Reload` : 'Load tokens from library'}
                </button>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-[11px] font-bold">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}

                {/* CSS Variables */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 shadow-2xl space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-inner">
                            <FileCode size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white">CSS Variables</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">:root — Style Dictionary compatible</span>
                        </div>
                    </div>

                    {hasTokens && (
                        <pre className="text-[9px] font-mono text-zinc-500 bg-black/50 rounded-xl p-3 overflow-auto max-h-32 leading-relaxed border border-zinc-900">
                            {generateCssVars(tokens).slice(0, 600)}{tokens.length > 5 ? '\n  ...' : ''}
                        </pre>
                    )}

                    <button
                        onClick={copyCss}
                        disabled={!hasTokens}
                        className={`w-full py-3 font-black text-[10px] uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${
                            hasTokens
                                ? 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
                                : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                        }`}
                    >
                        {copiedCss ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCss ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                </div>

                {/* DTCG JSON */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 shadow-2xl space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success/10 rounded-2xl text-success border border-success/20 shadow-inner">
                            <FileJson size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white">DTCG JSON</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">W3C Design Token Community Group format</span>
                        </div>
                    </div>

                    {hasTokens && (
                        <pre className="text-[9px] font-mono text-zinc-500 bg-black/50 rounded-xl p-3 overflow-auto max-h-32 leading-relaxed border border-zinc-900">
                            {generateDtcgJson(tokens).slice(0, 600)}{tokens.length > 3 ? '\n  ...' : ''}
                        </pre>
                    )}

                    <button
                        onClick={downloadJson}
                        disabled={!hasTokens}
                        className={`w-full py-3 font-black text-[10px] uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${
                            hasTokens
                                ? 'bg-success/10 hover:bg-success/20 text-success border-success/20'
                                : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                        }`}
                    >
                        <Download size={14} />
                        <span>Download 72f-tokens.json</span>
                    </button>
                </div>
            </section>

            <div className="p-4 bg-zinc-950/50 border border-zinc-900 rounded-[18px] text-[10px] font-medium text-zinc-600 leading-relaxed text-center">
                Compatible with Style Dictionary, Theo, and Tailwind CSS token pipelines.
            </div>
        </div>
    );
}
