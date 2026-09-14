// Local calendar-date <-> "YYYY-MM-DD" helpers. Kept in local Date fields
// (not UTC) so the native picker always shows exactly the Y/M/D the app
// stores, regardless of the device's timezone.

export function isoToLocalDate(iso: string): Date {
  const [y, m, d] = (iso || '').split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function localDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatIsoShort(iso: string): string {
  const date = isoToLocalDate(iso);
  return `${DIAS[date.getDay()]} ${date.getDate()} ${MESES_CORTO[date.getMonth()]}`;
}
