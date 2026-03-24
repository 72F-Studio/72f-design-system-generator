import React, { useState, useEffect } from "react";
import { Trash2, RefreshCcw, Layers, Palette } from "lucide-react";

export default function ManagerTab() {
  const [sets, setSets] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data.type === 'library-data') {
        setSets(e.data.sets || []);
        setThemes(e.data.themes || []);
      }
    };
    window.addEventListener("message", handleMsg);
    refresh();
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  const refresh = () => {
    window.parent.postMessage({ type: 'UI_READY' }, '*');
  };

  const deleteSet = (id: string) => {
    window.parent.postMessage({ type: 'DELETE_SET', id }, '*');
  };

  const deleteTheme = (id: string) => {
    window.parent.postMessage({ type: 'DELETE_THEME', id }, '*');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Active Architecture</h2>
        <button 
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 hover:text-white transition-all"
        >
          <RefreshCcw size={12} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Themes Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Layers size={16} className="text-primary"/>
            <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Themes</h3>
          </div>
          <div className="space-y-3">
            {themes.length > 0 ? themes.map((t) => (
              <div key={t.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-[20px] flex justify-between items-center shadow-lg hover:border-zinc-700 transition-all">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">{t.name}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{t.group}</span>
                </div>
                <button 
                  onClick={() => deleteTheme(t.id)}
                  className="p-2.5 bg-zinc-950 rounded-full text-zinc-600 hover:text-danger border border-zinc-800 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <div className="p-10 text-center border-2 border-dashed border-zinc-900 rounded-[24px] text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                No themes created
              </div>
            )}
          </div>
        </section>

        {/* Sets Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Palette size={16} className="text-success"/>
            <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Token Sets</h3>
          </div>
          <div className="space-y-3">
            {sets.length > 0 ? sets.map((s) => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-[20px] flex justify-between items-center shadow-lg hover:border-zinc-700 transition-all">
                <span className="text-xs font-black text-white truncate mr-4">{s.name}</span>
                <button 
                  onClick={() => deleteSet(s.id)}
                  className="p-2.5 bg-zinc-950 rounded-full text-zinc-600 hover:text-danger border border-zinc-800 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <div className="p-10 text-center border-2 border-dashed border-zinc-900 rounded-[24px] text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                No design sets found
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
