import { format, addWeeks, addMonths, addQuarters, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfWeek, endOfMonth, endOfQuarter, endOfYear, isBefore, isAfter, parseISO } from 'date-fns';
import { TimelineConfig, TimelineCell, TimelineCard, Granularity } from '@/types';

/**
 * Timeline Engine - Core logic for generating timeline cells and managing time-based operations
 */

export function buildCells(config: TimelineConfig): TimelineCell[] {
  const cells: TimelineCell[] = [];
  const start = parseISO(config.startDate);
  const end = parseISO(config.endDate);
  
  let current = new Date(start);
  let index = 0;

  while (isBefore(current, end) || current.getTime() === end.getTime()) {
    const cellEnd = getCellEnd(current, config.granularity, config.step);
    
    // Don't create cells beyond the end date
    if (isAfter(cellEnd, end)) {
      // But include the last cell if it starts before end
      if (isBefore(current, end)) {
        const label = formatCellLabel(current, config.granularity, config.labelFormat);
        cells.push({
          start: new Date(current),
          end: new Date(end),
          label,
          index: index++,
        });
      }
      break;
    }

    const label = formatCellLabel(current, config.granularity, config.labelFormat);
    
    cells.push({
      start: new Date(current),
      end: new Date(cellEnd),
      label,
      index: index++,
    });

    current = getNextCellStart(current, config.granularity, config.step);
    
    // Safety check to avoid infinite loops
    if (cells.length > 10000) {
      console.warn('Too many cells generated, stopping');
      break;
    }
  }

  return cells;
}

function getCellEnd(start: Date, granularity: Granularity, step: number): Date {
  switch (granularity) {
    case 'week':
      return addWeeks(start, step);
    case 'month':
      return addMonths(start, step);
    case 'quarter':
      return addQuarters(start, step);
    case 'half-year':
      return addMonths(start, step * 6);
    case 'year':
      return addMonths(start, step * 12);
    default:
      return addMonths(start, step);
  }
}

function getNextCellStart(current: Date, granularity: Granularity, step: number): Date {
  return getCellEnd(current, granularity, step);
}

function formatCellLabel(date: Date, granularity: Granularity, customFormat?: string): string {
  if (customFormat) {
    return format(date, customFormat);
  }

  switch (granularity) {
    case 'week':
      return `S${format(date, 'w')}`;
    case 'month':
      return format(date, 'MMM');
    case 'quarter':
      return `T${Math.floor(date.getMonth() / 3) + 1}`;
    case 'half-year':
      return date.getMonth() < 6 ? 'S1' : 'S2';
    case 'year':
      return format(date, 'yyyy');
    default:
      return format(date, 'MMM yyyy');
  }
}

export function snapDateToCell(
  date: Date,
  cells: TimelineCell[],
  mode: "cell" | "subCell" = "cell"
): Date {
  if (cells.length === 0) return date;

  // Find the closest cell
  let closestCell = cells[0];
  let minDiff = Math.abs(date.getTime() - cells[0].start.getTime());

  for (const cell of cells) {
    const diff = Math.abs(date.getTime() - cell.start.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestCell = cell;
    }
  }

  if (mode === "cell") {
    return new Date(closestCell.start);
  } else {
    // subCell mode: snap to start or middle of cell
    const cellDuration = closestCell.end.getTime() - closestCell.start.getTime();
    const midPoint = new Date(closestCell.start.getTime() + cellDuration / 2);
    
    return date.getTime() < midPoint.getTime() 
      ? new Date(closestCell.start)
      : new Date(closestCell.end);
  }
}

export function projectToGridSpan(
  projectStart: Date,
  projectEnd: Date,
  cells: TimelineCell[]
): { startIndex: number; endIndex: number } {
  if (cells.length === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  let startIndex = 0;
  let endIndex = cells.length - 1;

  // Find start index
  for (let i = 0; i < cells.length; i++) {
    if (isBefore(projectStart, cells[i].end) || projectStart.getTime() === cells[i].start.getTime()) {
      startIndex = i;
      break;
    }
  }

  // Find end index (exclusive, so we use the next cell)
  for (let i = startIndex; i < cells.length; i++) {
    if (isAfter(projectEnd, cells[i].start) && (i === cells.length - 1 || isBefore(projectEnd, cells[i + 1].start))) {
      endIndex = i + 1;
      break;
    }
  }

  return { startIndex, endIndex };
}

export function splitIntoCards(
  cells: TimelineCell[],
  config: TimelineConfig
): TimelineCard[] {
  if (config.cardSplitUnit === "none" || cells.length === 0) {
    return [{
      title: format(parseISO(config.startDate), 'yyyy') + ' - ' + format(parseISO(config.endDate), 'yyyy'),
      cellsRange: { startIndex: 0, endIndex: cells.length },
      cells: cells,
    }];
  }

  const cards: TimelineCard[] = [];
  let currentIndex = 0;

  while (currentIndex < cells.length) {
    const startCell = cells[currentIndex];
    const endIndex = getCardEndIndex(currentIndex, cells, config);
    const endCell = cells[Math.min(endIndex - 1, cells.length - 1)];

    const title = formatCardTitle(startCell.start, endCell.end, config.cardSplitUnit, config.cardSplitSize);
    
    cards.push({
      title,
      cellsRange: { startIndex: currentIndex, endIndex },
      cells: cells.slice(currentIndex, endIndex),
    });

    currentIndex = endIndex;
  }

  return cards;
}

function getCardEndIndex(
  startIndex: number,
  cells: TimelineCell[],
  config: TimelineConfig
): number {
  if (startIndex >= cells.length) return cells.length;

  const startDate = cells[startIndex].start;
  let targetDate: Date;

  switch (config.cardSplitUnit) {
    case 'year':
      targetDate = addMonths(startDate, config.cardSplitSize * 12);
      break;
    case 'half-year':
      targetDate = addMonths(startDate, config.cardSplitSize * 6);
      break;
    case 'quarter':
      targetDate = addQuarters(startDate, config.cardSplitSize);
      break;
    case 'month':
      targetDate = addMonths(startDate, config.cardSplitSize);
      break;
    default:
      return cells.length;
  }

  // Find the cell index that matches or exceeds targetDate
  for (let i = startIndex; i < cells.length; i++) {
    if (!isBefore(cells[i].start, targetDate)) {
      return i;
    }
  }

  return cells.length;
}

function formatCardTitle(start: Date, end: Date, unit: string, size: number): string {
  if (unit === 'year') {
    if (size === 1) {
      return format(start, 'yyyy');
    }
    return `${format(start, 'yyyy')} - ${format(end, 'yyyy')}`;
  }
  
  return `${format(start, 'MMM yyyy')} - ${format(end, 'MMM yyyy')}`;
}

/**
 * Adjust project dates when granularity changes
 */
export function adjustProjectToGranularity(
  projectStart: Date,
  projectEnd: Date,
  cells: TimelineCell[]
): { start: Date; end: Date; adjusted: boolean } {
  const snappedStart = snapDateToCell(projectStart, cells, "cell");
  const snappedEnd = snapDateToCell(projectEnd, cells, "cell");

  // Ensure end is after start
  let finalEnd = snappedEnd;
  if (finalEnd.getTime() <= snappedStart.getTime()) {
    // Find the next cell after start
    const startSpan = projectToGridSpan(snappedStart, snappedStart, cells);
    if (startSpan.endIndex < cells.length) {
      finalEnd = cells[startSpan.endIndex].start;
    } else {
      finalEnd = new Date(snappedStart.getTime() + (cells[0]?.end.getTime() - cells[0]?.start.getTime() || 86400000));
    }
  }

  const adjusted = 
    snappedStart.getTime() !== projectStart.getTime() ||
    finalEnd.getTime() !== projectEnd.getTime();

  return {
    start: snappedStart,
    end: finalEnd,
    adjusted,
  };
}

