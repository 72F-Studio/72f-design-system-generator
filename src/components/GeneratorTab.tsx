import React, { useState, useEffect } from "react";
import { PRESETS } from "../presets/data";
import { getContrastRatio, getWCAGLevel, ensureContrast } from "../utils/accessibility";
import { Trash2, Plus, Sparkles, ChevronDown, Check, Zap, PencilRuler, ArrowRight } from "lucide-react";

export default function GeneratorTab() {
  const [selectedPresetId, setSelectedPreset] = useState("");
  const [density, setDensity] = useState("1.0");
  const [gridCols, setGridCols] = useState("12");
  const [availableFonts, setAvailableFonts] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState("foundations");
  
  // State for the generated system
  const [sets, setSets] = useState<any[]>([]);
  const [themeName, setThemeName] = useState("");

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data.type === 'available-fonts') setAvailableFonts(e.data.data);
    };
    window.addEventListener("message", handleMsg);
    window.parent.postMessage({ type: 'UI_READY' }, '*');
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  const onPresetChange = (id: string) => {
    setSelectedPreset(id);
    const preset = PRESETS.find(p => p.id === id);
    if (!preset) return;

    setThemeName(`${preset.name} Theme`);
    const lightSet = createSetData(preset, 'light');
    const darkSet = createSetData(preset, 'dark');
    setSets([lightSet, darkSet]);
  };

  const createSetData = (preset: any, mode: 'light' | 'dark' | 'custom') => {
    let bgHex = (mode === 'dark') ? "#111111" : (preset.defaults.colors.find((c:any) => c.name.toLowerCase().includes('background'))?.hex || "#ffffff");
    const colors = [...preset.defaults.colors];
    const hasColor = (n: string) => colors.some(c => c.name.toLowerCase().includes(n));
    const primary = colors.find((c:any) => c.name.toLowerCase().includes('primary') || c.name.toLowerCase().includes('brand'))?.hex || '#006FEE';
    
    if (!hasColor('success')) colors.push({ name: 'Success', hex: '#17c964' });
    if (!hasColor('error')) colors.push({ name: 'Error', hex: '#f31260' });
    if (!hasColor('warning')) colors.push({ name: 'Warning', hex: '#f5a524' });
    if (!hasColor('info')) colors.push({ name: 'Info', hex: '#006FEE' });
    if (!hasColor('link')) colors.push({ name: 'Link', hex: primary });

    const adjustedColors = colors.map(c => {
        let fHex = c.name.toLowerCase().includes('background') ? bgHex : (c.name.toLowerCase().includes('foreground') ? (mode === 'dark' ? "#eeeeee" : "#111111") : ensureContrast(c.hex, bgHex));
        return { name: c.name, hex: fHex };
    });

    return {
      name: mode === 'light' ? "Light Set" : (mode === 'dark' ? "Dark Set" : "New Set"),
      colors: adjustedColors,
      fonts: { ...preset.defaults.fonts }
    };
  };

  const deploy = () => {
    const preset = activeSubTab === 'foundations' ? PRESETS.find(p => p.id === selectedPresetId) : PRESETS[0];
    window.parent.postMessage({
      type: 'GENERATE_SYSTEM',
      preset: preset || PRESETS[0],
      themeName: themeName || "Custom System",
      sets,
      layout: { density: parseFloat(density), gridCols: parseInt(gridCols) }
    }, '*');
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in duration-500">
      {/* Sub-Tabs */}
      <div className="flex p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <button
          onClick={() => setActiveSubTab("foundations")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === "foundations" ? "bg-zinc-800 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-400"}`}
        >
          <Zap size={14} />
          <span>Quick</span>
        </button>
        <button
          onClick={() => setActiveSubTab("architect")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === "architect" ? "bg-zinc-800 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-400"}`}
        >
          <PencilRuler size={14} />
          <span>Architect</span>
        </button>
      </div>

      {activeSubTab === "foundations" ? (
        <div className="space-y-6">
          <div className="px-2 flex flex-col gap-2">
            <span className="text-[12px] font-black uppercase tracking-[0.25em] text-zinc-500">1. Design Foundation</span>
            <div className="relative">
              <select 
                value={selectedPresetId}
                onChange={(e) => onPresetChange(e.target.value)}
                className="w-full h-16 pl-5 pr-12 bg-zinc-900 border-2 border-zinc-800 rounded-[20px] text-[16px] font-bold text-zinc-100 appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="" disabled>Choose a system...</option>
                {PRESETS.slice(1).map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div className="px-2 flex flex-col gap-2">
            <span className="text-[12px] font-black uppercase tracking-[0.25em] text-zinc-500">1. System Identity</span>
            <input 
              type="text"
              placeholder="e.g. Pro UI Kit"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="w-full h-16 px-5 bg-zinc-900 border-2 border-zinc-800 rounded-[20px] text-[16px] font-bold text-zinc-100 focus:outline-none focus:border-primary transition-all placeholder:text-zinc-700"
            />
          </div>
          <button 
            onClick={() => setSets([...sets, { name: "New Set", colors: [], fonts: {} }])}
            className="w-full flex items-center justify-center gap-3 h-16 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[20px] text-zinc-500 font-black text-sm uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-400 transition-all"
          >
            <Plus size={20} />
            <span>Add Empty Set</span>
          </button>
        </div>
      )}

      {/* Token Sets Section */}
      {sets.length > 0 && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <span className="text-[12px] font-black uppercase tracking-[0.25em] text-zinc-500 px-2">2. Token Architecture</span>
          {sets.map((set, setIdx) => (
            <div key={setIdx} className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center gap-4">
                <input 
                  type="text"
                  value={set.name}
                  onChange={(e) => {
                    const newSets = [...sets];
                    newSets[setIdx].name = e.target.value;
                    setSets(newSets);
                  }}
                  className="bg-transparent border-none text-white font-black text-lg focus:outline-none focus:ring-0 w-full p-0"
                />
                <button className="p-3 bg-black/40 rounded-full text-zinc-600 hover:text-danger transition-colors"><Trash2 size={18}/></button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {set.colors.map((c: any, cIdx: number) => {
                  const bgHex = set.colors.find((x:any) => x.name.toLowerCase().includes('background'))?.hex || "#ffffff";
                  const ratio = getContrastRatio(c.hex, bgHex);
                  const level = getWCAGLevel(ratio);
                  return (
                    <div key={cIdx} className="flex items-center justify-between bg-black/40 p-4 rounded-[22px] border border-zinc-800/50 group hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-10 h-10 shrink-0 rounded-full border-2 border-zinc-800 group-hover:border-zinc-600 overflow-hidden transition-all">
                          <input 
                            type="color" 
                            value={c.hex} 
                            onChange={(e) => {
                              const newSets = [...sets];
                              newSets[setIdx].colors[cIdx].hex = e.target.value;
                              setSets(newSets);
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 scale-150"
                          />
                          <div className="w-full h-full" style={{ backgroundColor: c.hex }}></div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-bold text-zinc-200 truncate pr-2 uppercase tracking-tight">{c.name}</span>
                          {!c.name.toLowerCase().includes('background') && (
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${level === 'Fail' ? 'bg-danger shadow-[0_0_8px_rgba(243,18,96,0.5)]' : 'bg-success shadow-[0_0_8px_rgba(23,201,100,0.5)]'}`}></div>
                              <span className={`text-[11px] font-black tracking-tighter ${level === 'Fail' ? 'text-danger' : 'text-success'}`}>
                                {ratio.toFixed(1)}:1 {level}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-600 font-bold px-2">{c.hex.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Config */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-6">
        <span className="text-[12px] font-black uppercase tracking-[0.25em] text-zinc-500 px-1">3. Global Parameters</span>
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-600 uppercase ml-2 tracking-widest">UI Density</span>
            <div className="relative">
              <select 
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                className="w-full h-14 pl-5 pr-12 bg-black/40 border-2 border-zinc-800 rounded-2xl text-[16px] font-bold text-zinc-300 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="0.75">Compact (Tight)</option>
                <option value="1.0">Default (Balanced)</option>
                <option value="1.25">Comfortable (Spacious)</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black to-transparent z-40">
        <button 
          onClick={deploy}
          disabled={!selectedPresetId && activeSubTab === 'foundations'}
          className="w-full h-16 bg-primary text-white font-black text-[16px] uppercase tracking-[0.25em] rounded-full shadow-[0_15px_50px_-10px_rgba(0,111,238,0.6)] active:scale-[0.97] disabled:opacity-20 disabled:grayscale disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-4"
        >
          <Sparkles size={22} />
          <span>Generate Design System</span>
        </button>
      </div>
    </div>
  );
}
