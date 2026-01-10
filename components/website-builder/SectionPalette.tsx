'use client';

import { SECTION_TEMPLATES } from '@/lib/website-builder/sections';
import { SectionTemplate } from '@/lib/website-builder/types';

interface SectionPaletteProps {
  onAddSection: (template: SectionTemplate) => void;
}

export default function SectionPalette({ onAddSection }: SectionPaletteProps) {
  return (
    <div className="w-64 bg-[#050505] border-r border-subtle h-full overflow-y-auto">
      <div className="p-4 border-b border-subtle">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white font-geist">
          Sections
        </h3>
        <p className="text-xs text-neutral-500 font-geist mt-1">
          Drag or click to add
        </p>
      </div>
      
      <div className="p-2 space-y-1">
        {SECTION_TEMPLATES.map((template) => (
          <button
            key={template.type}
            onClick={() => onAddSection(template)}
            className="w-full p-3 text-left bg-[#030303] hover:bg-[#0a0a0a] border border-subtle hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white font-geist group-hover:text-purple-400 transition-colors">
                  {template.name}
                </div>
                <div className="text-xs text-neutral-500 font-geist mt-0.5">
                  {template.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
