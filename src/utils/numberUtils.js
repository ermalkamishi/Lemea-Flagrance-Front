/** Coerce API / form values (strings, decimals) to a finite number. */
export function toNumber(value, fallback = 0) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = parseFloat(String(value).replace(/,/g, '').replace(/[^\d.-]/g, ''), 10);
  return Number.isFinite(n) ? n : fallback;
}
