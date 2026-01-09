'use client';

import { useRef } from 'react';
import { TimelineCard as TimelineCardType } from '@/types';
import { ProjectTag } from './ProjectTag';
import { usePlanningStore } from '@/store/usePlanningStore';
import { parseISO } from 'date-fns';
import { projectToGridSpan } from '@/lib/timeline-engine';
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, DragStartEvent } from '@dnd-kit/core';

interface TimelineCardProps {
  card: TimelineCardType;
  cardIndex: number;
}

export function TimelineCard({ card, cardIndex }: TimelineCardProps) {
  const cells = usePlanningStore((state) => state.getCells());
  const projects = usePlanningStore((state) => state.getProjectsForCard(cardIndex));
  const selectedProjectId = usePlanningStore((state) => state.selectedProjectId);
  const setSelectedProject = usePlanningStore((state) => state.setSelectedProject);
  const moveProject = usePlanningStore((state) => state.moveProject);

  // Get projects sorted by row, then by start date
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
  });

  // Calculate row heights
  const maxRow = Math.max(0, ...projects.map((p) => p.row));
  const rowHeight = 60;
  const headerHeight = 80;

  // Configure sensors for drag - moins sensible
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Only activate after 8px of movement
      },
    })
  );

  const dragStateRef = useRef<{
    lastUpdate: { cellIndex: number; row: number } | null;
    activeProject: any | null;
    mouseMoveHandler: ((e: MouseEvent) => void) | null;
  }>({ 
    lastUpdate: null,
    activeProject: null,
    mouseMoveHandler: null,
  });

  const handleDragStart = (event: DragStartEvent) => {
    // Reset drag state
    dragStateRef.current.lastUpdate = null;
    
    if (event.active.data.current) {
      dragStateRef.current.activeProject = event.active.data.current.project;
      
      // Create a global mouse move handler for better cursor tracking
      const container = document.querySelector(`[data-card-index="${cardIndex}"] .relative`) as HTMLElement;
      if (!container) return;

      const mouseMoveHandler = (e: MouseEvent) => {
        const containerRect = container.getBoundingClientRect();
        const cellWidth = containerRect.width / cells.length;

        // Calculate position relative to container based on mouse position
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;

        // Calculate which cell and row we're over
        const newCellIndex = Math.floor(x / cellWidth);
        const newRow = Math.max(0, Math.floor(y / rowHeight));

        const clampedCellIndex = Math.max(0, Math.min(newCellIndex, cells.length - 1));

        // Only update if position actually changed
        const lastUpdate = dragStateRef.current.lastUpdate;
        if (lastUpdate && lastUpdate.cellIndex === clampedCellIndex && lastUpdate.row === newRow) {
          return;
        }

        dragStateRef.current.lastUpdate = { cellIndex: clampedCellIndex, row: newRow };

        const draggedProject = dragStateRef.current.activeProject;
        if (!draggedProject) return;

        // Calculate new dates preserving span length
        const projectStart = parseISO(draggedProject.startDate);
        const projectEnd = parseISO(draggedProject.endDate);
        const currentSpan = projectToGridSpan(projectStart, projectEnd, cells);

        const spanLength = currentSpan.endIndex - currentSpan.startIndex;
        
        // Position based on where the cursor is (center the project on the cursor position)
        const newStartIndex = Math.max(0, Math.min(
          clampedCellIndex - Math.floor(spanLength / 2),
          cells.length - spanLength
        ));
        const newEndIndex = Math.min(newStartIndex + spanLength, cells.length);

        const newStart = cells[newStartIndex]?.start;
        const newEnd = cells[newEndIndex]?.end || cells[newEndIndex - 1]?.end;

        if (newStart && newEnd) {
          moveProject(draggedProject.id, newStart.toISOString(), newEnd.toISOString(), newRow);
        }
      };

      dragStateRef.current.mouseMoveHandler = mouseMoveHandler;
      window.addEventListener('mousemove', mouseMoveHandler);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This is called by dnd-kit, but we use the global mouse move handler for better tracking
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Clean up global mouse move handler
    if (dragStateRef.current.mouseMoveHandler) {
      window.removeEventListener('mousemove', dragStateRef.current.mouseMoveHandler);
      dragStateRef.current.mouseMoveHandler = null;
    }
    
    // Reset drag state
    dragStateRef.current.lastUpdate = null;
    dragStateRef.current.activeProject = null;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-card border border-line rounded-card shadow-card overflow-hidden" data-card-index={cardIndex}>
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gold/20 to-white/90 border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold text-navy tracking-wide">{card.title}</h2>
        </div>

        {/* Timeline Grid */}
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: `${card.cells.length * 120}px` }}>
            {/* Grid Header */}
            <div
              className="sticky top-0 z-20 bg-gradient-to-b from-gold/16 to-white/90 border-b-2 border-grid-strong"
              style={{ height: `${headerHeight}px` }}
            >
              <div className="flex h-full">
                {card.cells.map((cell, idx) => (
                  <div
                    key={idx}
                    className="flex-1 border-r-2 border-grid-strong px-2 flex items-center justify-center font-mono text-xs font-black text-navy"
                    style={{ minWidth: '120px' }}
                  >
                    {cell.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Body with Projects */}
            <div
              className="relative bg-[#faf9f6]"
              style={{ height: `${(maxRow + 1) * rowHeight + 20}px` }}
              onMouseDown={(e) => {
                // Allow clicking on empty space to deselect
                if (e.target === e.currentTarget) {
                  setSelectedProject(null);
                }
              }}
            >
              {/* Grid Lines */}
              {card.cells.map((cell, idx) => (
                <div
                  key={`line-${idx}`}
                  className="absolute top-0 bottom-0 border-r-2 border-grid-strong"
                  style={{
                    left: `${(idx / card.cells.length) * 100}%`,
                    width: `${(1 / card.cells.length) * 100}%`,
                  }}
                />
              ))}

              {/* Project Tags */}
              {sortedProjects.map((project) => {
                const projectStart = parseISO(project.startDate);
                const projectEnd = parseISO(project.endDate);
                const span = projectToGridSpan(projectStart, projectEnd, cells);
                
                // Calculate position relative to this card
                const cardStartIndex = card.cellsRange.startIndex;
                const cardEndIndex = card.cellsRange.endIndex;
                
                // Check if project overlaps with this card
                if (span.endIndex <= cardStartIndex || span.startIndex >= cardEndIndex) {
                  return null;
                }

                const visibleStartIndex = Math.max(span.startIndex, cardStartIndex);
                const visibleEndIndex = Math.min(span.endIndex, cardEndIndex);
                
                const leftPercent = ((visibleStartIndex - cardStartIndex) / card.cells.length) * 100;
                const widthPercent = ((visibleEndIndex - visibleStartIndex) / card.cells.length) * 100;

                return (
                  <ProjectTag
                    key={project.id}
                    project={project}
                    left={`${leftPercent}%`}
                    width={`${widthPercent}%`}
                    top={`${project.row * rowHeight + 10}px`}
                    height={`${rowHeight - 20}px`}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => setSelectedProject(project.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
