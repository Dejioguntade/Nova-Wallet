import { differenceInCalendarDays, format, isBefore, parseISO } from 'date-fns';

export const formatDisplayDate = (isoDate?: string, pattern = 'dd MMM yyyy') => {
  if (!isoDate) return '—';
  return format(parseISO(isoDate), pattern);
};

export const daysUntil = (isoDate?: string) => {
  if (!isoDate) return null;
  return differenceInCalendarDays(parseISO(isoDate), new Date());
};

export const isExpired = (isoDate?: string) => {
  if (!isoDate) return false;
  return isBefore(parseISO(isoDate), new Date());
};

export const formatCardExpiry = (month: number, year: number) => {
  const paddedMonth = month.toString().padStart(2, '0');
  return `${paddedMonth}/${year.toString().slice(-2)}`;
};
