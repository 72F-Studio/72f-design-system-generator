import React from 'react';
import { ExternalLink, Github, MessageSquare, Briefcase } from 'lucide-react';

const LINKS = [
  {
    group: 'Work with me',
    items: [
      { label: 'Upwork',    url: 'https://www.upwork.com/freelancers/~01aa3fe819d66933f5', desc: 'Hire for freelance projects' },
      { label: 'LinkedIn',  url: 'https://www.linkedin.com/in/parthkulkarni98/',             desc: 'Connect for opportunities' },
      { label: 'Peerlist',  url: 'https://peerlist.io/72fstudio',                             desc: 'Professional profile' },
    ],
  },
  {
    group: 'Portfolio',
    items: [
      { label: 'Dribbble',  url: 'https://dribbble.com/72fstudio',          desc: 'UI/UX work' },
      { label: 'Behance',   url: 'https://www.behance.net/parthkulkarni7',   desc: 'Design case studies' },
      { label: 'Instagram', url: 'https://www.instagram.com/72fstudio',      desc: 'Studio updates' },
    ],
  },
  {
    group: 'Writing',
    items: [
      { label: 'Medium',    url: 'https://medium.com/@72fstudio',            desc: 'Design articles' },
      { label: 'Substack',  url: 'https://substack.com/@72fstudio',          desc: 'Newsletter' },
    ],
  },
  {
    group: 'Source',
    items: [
      { label: 'GitHub',    url: 'https://github.com/72F-Studio',            desc: 'Open source work' },
    ],
  },
];

function openLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function AboutTab() {
  return (
    <div className="space-y-6 pb-4">
      {/* Hero */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-primary italic">72</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Parth Kulkarni</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">72F Studio</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed pt-1">
          Product designer &amp; developer building tools for the design community.
          Reach out for freelance work, collaborations, or feature requests.
        </p>
      </div>

      {/* Feature request CTA */}
      <button
        onClick={() => openLink('https://github.com/72F-Studio/72f-design-system-generator/issues/new')}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded-xl transition-all group"
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-primary" />
          <div className="text-left">
            <p className="text-xs font-bold text-primary">Feature Request / Bug Report</p>
            <p className="text-[10px] text-zinc-500">Open an issue on GitHub</p>
          </div>
        </div>
        <ExternalLink size={12} className="text-primary/50 group-hover:text-primary transition-colors" />
      </button>

      {/* Link groups */}
      {LINKS.map(group => (
        <div key={group.group} className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1 pb-1">{group.group}</p>
          <div className="space-y-1">
            {group.items.map(item => (
              <button
                key={item.label}
                onClick={() => openLink(item.url)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-zinc-400">{item.label.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-zinc-200">{item.label}</p>
                    <p className="text-[10px] text-zinc-600">{item.desc}</p>
                  </div>
                </div>
                <ExternalLink size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-center text-[9px] text-zinc-700 pb-2">72F Design System Generator • Open Source</p>
    </div>
  );
}
