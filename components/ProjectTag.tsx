'use client';

import { useState, useRef, useEffect } from 'react';
import { Project } from '@/types';
import { usePlanningStore } from '@/store/usePlanningStore';
import { parseISO } from 'date-fns';
import { snapDateToCell, projectToGridSpan } from '@/lib/timeline-engine';
import { useDraggable } from '@dnd-kit/core';

interface ProjectTagProps {
  project: Project;
  left: string;
  width: string;
  top: string;
  height: string;
  isSelected: boolean;
  onClick: () => void;
}

const ROW_HEIGHT = 60;

export function ProjectTag({ project, left, width, top, height, isSelected, onClick }: ProjectTagProps) {
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  
  const cells = usePlanningStore((state) => state.getCells());
  const getProjectColor = usePlanningStore((state) => state.getProjectColor);
  const moveProject = usePlanningStore((state) => state.moveProject);
  const resizeProject = usePlanningStore((state) => state.resizeProject);
  const timelineConfig = usePlanningStore((state) => state.timelineConfig);

  const color = getProjectColor(project);
  const displayText = project.code ? `${project.code} - ${project.name}` : project.name;

  // Use dnd-kit for dragging
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: project.id,
    data: {
      type: 'project',
      project,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(side);
  };

  // Resize effect
  useEffect(() => {
    if (!isResizing) return;

    const projectStart = parseISO(project.startDate);
    const projectEnd = parseISO(project.endDate);
    let lastCellIndex: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!tagRef.current) return;

      const container = tagRef.current.closest('.relative');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;
      const cellWidth = containerWidth / cells.length;

      const cellIndex = Math.floor(x / cellWidth);
      const clampedCellIndex = Math.max(0, Math.min(cellIndex, cells.length - 1));

      if (lastCellIndex === clampedCellIndex) return;
      lastCellIndex = clampedCellIndex;

      const targetCell = cells[clampedCellIndex];
      if (!targetCell) return;

      // Calculate minimum cell duration
      const minCellDuration = cells[0]?.end.getTime() - cells[0]?.start.getTime() || 86400000;
      const currentDuration = projectEnd.getTime() - projectStart.getTime();

      if (isResizing === 'left') {
        const newStart = snapDateToCell(targetCell.start, cells, timelineConfig.snapMode || 'cell');
        // Calculate the new duration if we move the start
        const newDuration = projectEnd.getTime() - newStart.getTime();
        
        // Only allow resize if the new duration is at least 1 cell
        if (newStart.getTime() < projectEnd.getTime() && newDuration >= minCellDuration) {
          resizeProject(project.id, newStart.toISOString(), project.endDate);
        }
      } else {
        const newEnd = snapDateToCell(targetCell.end, cells, timelineConfig.snapMode || 'cell');
        // Calculate the new duration if we move the end
        const newDuration = newEnd.getTime() - projectStart.getTime();
        
        // Only allow resize if the new duration is at least 1 cell
        if (newEnd.getTime() > projectStart.getTime() && newDuration >= minCellDuration) {
          resizeProject(project.id, project.startDate, newEnd.toISOString());
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, cells, project, resizeProject, timelineConfig.snapMode]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) {
          (tagRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          node.setAttribute('data-project-id', project.id);
        }
      }}
      className={`absolute rounded-xl shadow-card select-none ${
        isSelected ? 'ring-2 ring-gold ring-offset-2' : ''
      } ${isDragging ? 'opacity-80 z-50' : 'z-10'}`}
      style={{
        left,
        width,
        top,
        height,
        backgroundColor: color,
        color: '#1b2a4a',
        border: '1px solid rgba(27,42,74,.12)',
        boxShadow: '0 10px 16px rgba(27,42,74,.10)',
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
        ...(isDragging ? style : {}),
      }}
      onClick={(e) => {
        // Only handle click if not resizing and not dragging
        if (!isResizing && !isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div
        className="h-full flex items-center justify-center px-3 text-xs font-black text-center overflow-hidden text-ellipsis relative"
        {...listeners}
        {...attributes}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span className="font-mono font-black mr-1 opacity-85">{project.code}</span>
        <span className="font-black">— {project.name}</span>
      </div>
      
      {/* Resize Handles */}
      <div
        className="resize-handle absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white hover:bg-opacity-30 z-20"
        onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
      />
      <div
        className="resize-handle absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white hover:bg-opacity-30 z-20"
        onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
      />
    </div>
  );
}
