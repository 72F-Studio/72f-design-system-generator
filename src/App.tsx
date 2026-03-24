import React, { useState, useEffect } from "react";
import { ScrollText, LayoutDashboard, Settings2, Download } from "lucide-react";
import GeneratorTab from "./components/GeneratorTab";
import ManagerTab from "./components/ManagerTab";
import ExportTab from "./components/ExportTab";

export default function App() {
  const [activeTab, setActiveTab] = useState("generator");
  const [isLogVisible, setIsLogVisible] = useState(false);
  const [logs, setLogs] = useState<{msg: string, level: string}[]>([]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'log') {
        setLogs(prev => [{msg: e.data.message, level: e.data.level}, ...prev].slice(0, 50));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shrink-0 border-b border-zinc-900 bg-black/50 backdrop-blur-md z-20">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white italic uppercase text-primary">72F</h1>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Design System Generator • V1.0</p>
        </div>
        <button 
          onClick={() => setIsLogVisible(!isLogVisible)}
          className={`p-2 rounded-full transition-all ${isLogVisible ? 'bg-primary/20 text-primary' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
        >
          <ScrollText size={18} />
        </button>
      </header>

      {/* Main Navigation (Pill Tabs) */}
      <div className="px-6 pt-4 shrink-0">
        <div className="flex p-1 bg-zinc-900/50 rounded-full border border-zinc-800">
          {[
            { id: "generator", icon: Settings2, label: "Generator" },
            { id: "manager", icon: LayoutDashboard, label: "Manager" },
            { id: "export", icon: Download, label: "Export" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar relative">
        <div className={activeTab === "generator" ? "block" : "hidden"}>
          <GeneratorTab />
        </div>
        <div className={activeTab === "manager" ? "block" : "hidden"}>
          <ManagerTab />
        </div>
        <div className={activeTab === "export" ? "block" : "hidden"}>
          <ExportTab />
        </div>
      </div>

      {/* Log Overlay */}
      {isLogVisible && (
        <div className="absolute bottom-20 left-6 right-6 max-h-40 overflow-hidden bg-black/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl z-30 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-900 bg-zinc-950/50">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">System Engine Log</span>
            <button onClick={() => setLogs([])} className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400">Clear</button>
          </div>
          <div className="p-3 overflow-y-auto max-h-32 font-mono text-[10px] space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-2 ${
                log.level === 'success' ? 'text-green-400' : 
                log.level === 'error' ? 'text-red-400' : 
                log.level === 'system' ? 'text-blue-400' : 'text-zinc-500'
              }`}>
                <span className="shrink-0 opacity-50">&gt;</span>
                <span>{log.msg}</span>
              </div>
            ))}
            {logs.length === 0 && <div className="text-zinc-700 italic">Idle... waiting for deployment</div>}
          </div>
        </div>
      )}
    </div>
  );
}
