const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats a "YYYY-MM-DD" date string (the format the backend stores/returns)
 * as "DD-MMM-YYYY", e.g. "2026-09-25" -> "25-Sep-2026".
 * Returns an empty string for missing/invalid input.
 */
export function formatDdMmmYyyy(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return '';
  const dd = String(day).padStart(2, '0');
  const mmm = MONTH_NAMES[month - 1];
  if (!mmm) return '';
  return `${dd}-${mmm}-${year}`;
}

/**
 * Parses a "DD-MMM-YYYY" string (e.g. "25-Sep-2026", as produced by
 * formatDdMmmYyyy) back into "YYYY-MM-DD". Returns null for invalid input.
 */
export function parseDdMmmYyyy(str: string | null | undefined): string | null {
  if (!str) return null;
  // Our CSV export wraps the date as ="DD-MMM-YYYY" so Excel displays it as
  // text instead of auto-converting it to a date serial; unwrap that here so
  // a re-imported export round-trips correctly.
  const unwrapped = str.trim().replace(/^="(.*)"$/, '$1');
  const match = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(unwrapped.trim());
  if (!match) return null;
  const [, dayStr, mmm, yearStr] = match;
  const month = MONTH_NAMES.findIndex(m => m.toLowerCase() === mmm.toLowerCase()) + 1;
  if (!month) return null;

  const day = Number(dayStr);
  const year = Number(yearStr);
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');

  const date = new Date(`${year}-${mm}-${dd}T00:00:00.000Z`);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${mm}-${dd}`;
}
