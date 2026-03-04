/**
 * Date utility functions
 */

export const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  return formatDate(date);
};

/**
 * Format a date string (YYYY-MM-DD) to a short human-readable label.
 * Returns "Today", "Tomorrow", or "Mon Jan 5" style format.
 */
export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Check if a date string (YYYY-MM-DD) represents a date in the past (before today).
 */
export const isOverdue = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Convert a local Date object to YYYY-MM-DD string without UTC shifts.
 * This avoids timezone bugs that occur with date.toISOString().slice(0, 10).
 */
export const toDateStringLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= now;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Time filter types used across the app for filtering tasks by date range.
 */
export type TaskTimeFilter = 'hidden' | 'thisWeek' | 'next7' | 'next30' | 'thisYear' | 'all';

/**
 * Check if a task's due date falls within a given time frame filter.
 * Handles missing due dates based on the hideUndated flag.
 */
export const isDateInTimeFrame = (
  dueDate: string | undefined,
  timeFilter: TaskTimeFilter,
  hideUndated: boolean = false,
): boolean => {
  if (timeFilter === 'all') return true;
  if (timeFilter === 'hidden') return false;

  if (!dueDate) return !hideUndated;

  const taskDate = new Date(dueDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (timeFilter === 'thisWeek') {
    const endOfWeek = new Date(now);
    const day = now.getDay();
    const diff = 7 - day;
    endOfWeek.setDate(now.getDate() + diff);
    endOfWeek.setHours(23, 59, 59, 999);
    return taskDate >= now && taskDate <= endOfWeek;
  }
  if (timeFilter === 'next7') {
    const next7 = new Date(now);
    next7.setDate(now.getDate() + 7);
    return taskDate >= now && taskDate <= next7;
  }
  if (timeFilter === 'next30') {
    const next30 = new Date(now);
    next30.setDate(now.getDate() + 30);
    return taskDate >= now && taskDate <= next30;
  }
  if (timeFilter === 'thisYear') {
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return taskDate >= now && taskDate <= endOfYear;
  }
  return true;
};

