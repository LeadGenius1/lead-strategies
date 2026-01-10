'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '@/lib/website-builder/types';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import CTA from '@/components/sections/CTA';

interface DragDropBuilderProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  isEditing?: boolean;
}

interface SortableSectionProps {
  section: Section;
  isEditing?: boolean;
  onUpdate: (id: string, content: Record<string, any>) => void;
  onDelete: (id: string) => void;
}

function SortableSection({ section, isEditing, onUpdate, onDelete }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderSection = () => {
    const commonProps = {
      section,
      isEditing,
      onUpdate: (content: Record<string, any>) => onUpdate(section.id, content),
    };

    switch (section.type) {
      case 'hero':
        return <Hero {...commonProps} />;
      case 'features':
        return <Features {...commonProps} />;
      case 'cta':
        return <CTA {...commonProps} />;
      default:
        return (
          <div className="p-8 text-center text-neutral-500">
            Section type "{section.type}" not implemented
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isEditing ? 'border-2 border-transparent hover:border-purple-500/50' : ''}`}
    >
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="bg-purple-500 text-white px-3 py-1 text-xs font-bold uppercase font-geist cursor-grab active:cursor-grabbing"
          >
            ⋮⋮ Drag
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="bg-red-500 text-white px-3 py-1 text-xs font-bold uppercase font-geist"
          >
            Delete
          </button>
        </div>
      )}
      {renderSection()}
    </div>
  );
}

export default function DragDropBuilder({
  sections,
  onSectionsChange,
  isEditing = false,
}: DragDropBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onSectionsChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleUpdate = (id: string, content: Record<string, any>) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, content: { ...s.content, ...content } } : s
    );
    onSectionsChange(updated);
  };

  const handleDelete = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isEditing={isEditing}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
          {sections.length === 0 && (
            <div className="p-12 text-center text-neutral-500 border-2 border-dashed border-subtle">
              <p className="font-geist">No sections yet. Add sections from the palette.</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
