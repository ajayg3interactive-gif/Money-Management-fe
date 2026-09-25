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
