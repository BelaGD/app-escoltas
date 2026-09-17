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

// "DD/MM/YYYY" <-> local Date, used by the vacation and assignment fields
// that were already storing dates in that format before the picker existed.
export function dmyToLocalDate(dmy: string): Date {
  const [d, m, y] = (dmy || '').split('/').map(Number);
  if (!d || !m || !y) return new Date();
  return new Date(y, m - 1, d);
}

export function localDateToDmy(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatDmyShort(dmy: string): string {
  const date = dmyToLocalDate(dmy);
  return `${DIAS[date.getDay()]} ${date.getDate()} ${MESES_CORTO[date.getMonth()]}`;
}

// "HH:mm" <-> local Date (only the time-of-day part matters).
export function hmToLocalDate(hm: string): Date {
  const [h, m] = (hm || '').split(':').map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 12, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

export function localDateToHm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// A UTC calendar-day timestamp (Date.UTC(...) math, as used throughout the
// agenda/ciclo calculations) <-> "YYYY-MM-DD", read with UTC getters so it
// round-trips exactly regardless of the device's timezone.
export function utcMsToIso(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isoToUtcMs(iso: string): number {
  const [y, m, d] = (iso || '').split('-').map(Number);
  if (!y || !m || !d) return Date.UTC(2026, 8, 12);
  return Date.UTC(y, m - 1, d);
}

