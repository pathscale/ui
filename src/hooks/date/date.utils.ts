export const DAYS_PER_WEEK = 7;
export const CALENDAR_GRID_DAYS = 42;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export type DateRangeValue = {
  start: Date;
  end: Date;
};

export const createCalendarDate = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day, 12, 0, 0, 0);

export const normalizeDate = (value: Date | null | undefined): Date | null => {
  if (!(value instanceof Date)) return null;
  if (Number.isNaN(value.getTime())) return null;

  return createCalendarDate(value.getFullYear(), value.getMonth(), value.getDate());
};

export const getToday = () => {
  const now = new Date();
  return createCalendarDate(now.getFullYear(), now.getMonth(), now.getDate());
};

export const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const parsed = createCalendarDate(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const formatDate = (
  value: Date | null | undefined,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) => {
  const date = normalizeDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(locale, options).format(date);
};

const pad = (value: number) => String(value).padStart(2, "0");

export const toISODate = (value: Date | null | undefined) => {
  const date = normalizeDate(value);
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toDateKey = (date: Date) =>
  date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();

export const compareDates = (left: Date, right: Date) =>
  toDateKey(left) - toDateKey(right);

export const compareMonths = (left: Date, right: Date) =>
  (left.getFullYear() - right.getFullYear()) * 12 + (left.getMonth() - right.getMonth());

export const isSameDay = (left: Date, right: Date) => compareDates(left, right) === 0;

export const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

export const startOfMonth = (date: Date) =>
  createCalendarDate(date.getFullYear(), date.getMonth(), 1);

export const addDays = (date: Date, amount: number) =>
  createCalendarDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);

export const addMonths = (date: Date, amount: number) =>
  createCalendarDate(date.getFullYear(), date.getMonth() + amount, 1);

export const shiftDateByMonths = (date: Date, amount: number) => {
  const base = createCalendarDate(date.getFullYear(), date.getMonth() + amount, 1);
  const maxDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  return createCalendarDate(base.getFullYear(), base.getMonth(), Math.min(date.getDate(), maxDay));
};

export const buildCalendarGrid = (monthStart: Date, weekStartsOn = 0) => {
  const monthFirstDay = startOfMonth(monthStart);
  const offset = (monthFirstDay.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const gridStart = addDays(monthFirstDay, -offset);

  return Array.from({ length: CALENDAR_GRID_DAYS }, (_, index) =>
    addDays(gridStart, index),
  );
};

export const splitWeeks = <T,>(items: T[], daysPerWeek = DAYS_PER_WEEK) => {
  const weeks: T[][] = [];

  for (let index = 0; index < items.length; index += daysPerWeek) {
    weeks.push(items.slice(index, index + daysPerWeek));
  }

  return weeks;
};

export const normalizeRange = (
  start: Date | null | undefined,
  end: Date | null | undefined,
): { start: Date | null; end: Date | null } => {
  const normalizedStart = normalizeDate(start);
  const normalizedEnd = normalizeDate(end);

  if (!normalizedStart && !normalizedEnd) {
    return { start: null, end: null };
  }

  if (normalizedStart && !normalizedEnd) {
    return { start: normalizedStart, end: null };
  }

  if (!normalizedStart && normalizedEnd) {
    return { start: normalizedEnd, end: null };
  }

  if (!normalizedStart || !normalizedEnd) {
    return { start: null, end: null };
  }

  if (compareDates(normalizedStart, normalizedEnd) <= 0) {
    return { start: normalizedStart, end: normalizedEnd };
  }

  return { start: normalizedEnd, end: normalizedStart };
};

export const createPreviewRange = (
  start: Date | null | undefined,
  end: Date | null | undefined,
  preview: Date | null | undefined,
) => {
  const normalizedStart = normalizeDate(start);
  const normalizedEnd = normalizeDate(end);
  const normalizedPreview = normalizeDate(preview);

  if (!normalizedStart || normalizedEnd || !normalizedPreview) {
    return { start: null as Date | null, end: null as Date | null };
  }

  if (compareDates(normalizedPreview, normalizedStart) < 0) {
    return { start: normalizedPreview, end: normalizedStart };
  }

  return { start: normalizedStart, end: normalizedPreview };
};
