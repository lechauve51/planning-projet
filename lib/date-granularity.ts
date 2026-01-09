import { parseISO, format, startOfYear, startOfQuarter, startOfMonth, startOfWeek, endOfYear, endOfQuarter, endOfMonth, endOfWeek, getQuarter, getMonth, getYear, addQuarters, addMonths, addWeeks, getISOWeek } from 'date-fns';
import { Granularity } from '@/types';

/**
 * Utility functions for converting between ISO dates and granularity-based formats
 */

export interface GranularityDate {
  year: number;
  quarter?: number; // 1-4
  semester?: number; // 1-2
  month?: number; // 1-12
  week?: number; // 1-52
}

/**
 * Convert an ISO date string to a granularity-based date format
 */
export function dateToGranularity(dateStr: string, granularity: Granularity): GranularityDate {
  const date = parseISO(dateStr);
  const year = getYear(date);

  switch (granularity) {
    case 'year':
      return { year };
    
    case 'half-year':
      const semester = getMonth(date) < 6 ? 1 : 2;
      return { year, semester };
    
    case 'quarter':
      const quarter = getQuarter(date);
      return { year, quarter };
    
    case 'month':
      const month = getMonth(date) + 1; // getMonth returns 0-11
      return { year, month };
    
    case 'week':
      // Get ISO week number
      const week = getISOWeek(date);
      // ISO weeks can span across years, so we need to get the year of the week
      const weekYear = getYear(date);
      return { year: weekYear, week };
    
    default:
      return { year };
  }
}

/**
 * Convert a granularity-based date format to an ISO date string (start of period)
 */
export function granularityToDateStart(granularityDate: GranularityDate, granularity: Granularity): string {
  const { year, quarter, semester, month, week } = granularityDate;
  let date: Date;

  switch (granularity) {
    case 'year':
      date = startOfYear(new Date(year, 0, 1));
      break;
    
    case 'half-year':
      const semesterMonth = semester === 1 ? 0 : 6; // Jan (0) or Jul (6)
      date = startOfMonth(new Date(year, semesterMonth, 1));
      break;
    
    case 'quarter':
      const quarterMonth = quarter ? (quarter - 1) * 3 : 0; // Q1=0, Q2=3, Q3=6, Q4=9
      date = startOfQuarter(new Date(year, quarterMonth, 1));
      break;
    
    case 'month':
      const monthIndex = month ? month - 1 : 0; // Convert 1-12 to 0-11
      date = startOfMonth(new Date(year, monthIndex, 1));
      break;
    
    case 'week':
      // For week, calculate the start of the ISO week
      // ISO weeks start on Monday
      const jan1 = new Date(year, 0, 1);
      // Get the first Monday of the year (or the Monday of the week containing Jan 1)
      const firstMonday = startOfWeek(jan1, { weekStartsOn: 1 });
      // Add weeks to get to the target week
      date = addWeeks(firstMonday, week ? week - 1 : 0);
      break;
    
    default:
      date = startOfYear(new Date(year, 0, 1));
  }

  return date.toISOString().split('T')[0];
}

/**
 * Convert a granularity-based date format to an ISO date string (end of period)
 */
export function granularityToDateEnd(granularityDate: GranularityDate, granularity: Granularity): string {
  const { year, quarter, semester, month, week } = granularityDate;
  let date: Date;

  switch (granularity) {
    case 'year':
      date = endOfYear(new Date(year, 11, 31));
      break;
    
    case 'half-year':
      const semesterMonth = semester === 1 ? 5 : 11; // Jun (5) or Dec (11)
      date = endOfMonth(new Date(year, semesterMonth, 1));
      break;
    
    case 'quarter':
      const quarterMonth = quarter ? quarter * 3 - 1 : 2; // Q1=Feb(1), Q2=May(4), Q3=Aug(7), Q4=Nov(10)
      date = endOfQuarter(new Date(year, quarterMonth, 1));
      break;
    
    case 'month':
      const monthIndex = month ? month - 1 : 0;
      date = endOfMonth(new Date(year, monthIndex, 1));
      break;
    
    case 'week':
      // For week end, calculate the end of the ISO week
      const jan1End = new Date(year, 0, 1);
      const firstMondayEnd = startOfWeek(jan1End, { weekStartsOn: 1 });
      const weekStart = addWeeks(firstMondayEnd, week ? week - 1 : 0);
      date = endOfWeek(weekStart, { weekStartsOn: 1 });
      break;
    
    default:
      date = endOfYear(new Date(year, 11, 31));
  }

  return date.toISOString().split('T')[0];
}

/**
 * Get available options for a granularity type
 */
export function getGranularityOptions(
  granularity: Granularity, 
  startYear: number, 
  endYear: number
): {
  years: number[];
  quarters?: number[];
  semesters?: number[];
  months?: number[];
  weeks?: number[];
} {
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  switch (granularity) {
    case 'year':
      return { years };
    
    case 'half-year':
      return { years, semesters: [1, 2] };
    
    case 'quarter':
      return { years, quarters: [1, 2, 3, 4] };
    
    case 'month':
      return { years, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
    
    case 'week':
      return { years, weeks: Array.from({ length: 52 }, (_, i) => i + 1) };
    
    default:
      return { years };
  }
}

/**
 * Format a granularity date for display
 */
export function formatGranularityDate(granularityDate: GranularityDate, granularity: Granularity): string {
  const { year, quarter, semester, month, week } = granularityDate;

  switch (granularity) {
    case 'year':
      return `${year}`;
    
    case 'half-year':
      return `${year} - S${semester}`;
    
    case 'quarter':
      return `${year} - T${quarter}`;
    
    case 'month':
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      return `${year} - ${monthNames[month ? month - 1 : 0]}`;
    
    case 'week':
      return `${year} - S${week}`;
    
    default:
      return `${year}`;
  }
}

