import React from "react";
import { FileCode, FileJson, Copy, Download } from "lucide-react";

export default function ExportTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Developer Handoff</h2>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 shadow-2xl space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-inner">
              <FileCode size={24}/>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">CSS Variables</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">:root architecture</span>
            </div>
          </div>
          <button className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary font-black text-[10px] uppercase tracking-widest rounded-xl border border-primary/20 transition-all flex items-center justify-center gap-2">
            <Copy size={14}/>
            <span>Copy to Clipboard</span>
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 shadow-2xl space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-2xl text-success border border-success/20 shadow-inner">
              <FileJson size={24}/>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">DTCG JSON</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Standard Format</span>
            </div>
          </div>
          <button className="w-full py-3 bg-success/10 hover:bg-success/20 text-success font-black text-[10px] uppercase tracking-widest rounded-xl border border-success/20 transition-all flex items-center justify-center gap-2">
            <Download size={14}/>
            <span>Download .json</span>
          </button>
        </div>
      </section>

      <div className="p-5 bg-zinc-950/50 border border-zinc-900 rounded-[20px] text-[10px] font-medium text-zinc-500 leading-relaxed italic text-center">
        &quot;Exported tokens are fully compatible with Style Dictionary and modern tailwind configurations.&quot;
      </div>
    </div>
  );
}
