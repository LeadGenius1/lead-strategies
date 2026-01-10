'use client';

import { SECTION_TEMPLATES } from '@/lib/website-builder/sections';
import { SectionTemplate } from '@/lib/website-builder/types';
import SectionIcon from '@/components/icons/SectionIcon';

interface SectionPaletteProps {
  onAddSection: (template: SectionTemplate) => void;
}

export default function SectionPalette({ onAddSection }: SectionPaletteProps) {
  return (
    <div className="w-64 bg-[#050505] border-r border-subtle h-full overflow-y-auto">
      <div className="p-4 border-b border-subtle">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          Sections
        </h3>
        <p className="text-xs text-neutral-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
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
              <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                <SectionIcon type={template.type} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {template.name}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
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
