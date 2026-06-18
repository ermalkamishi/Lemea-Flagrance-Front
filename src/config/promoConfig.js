// ============================================================
// PROMO CONFIG — June 18-23, 2026
// All perfumes (Parfume + Për meshkuj) at 1,399 Den for 5 days.
// After June 23, isPromoActive() returns false and everything
// auto-hides. This file can safely be removed after that date.
// ============================================================

export const PROMO = {
  start: new Date('2026-06-18T00:00:00+02:00').getTime(),
  end:   new Date('2026-06-23T23:59:59+02:00').getTime(),
  price: 1399,
  // ONLY these two categories get the promo price override
  PERFUME_CATEGORIES: ['Parfume', 'Për meshkuj'],
};

/** Returns true only while the promotion window is open. */
export const isPromoActive = () => {
  const now = Date.now();
  return now >= PROMO.start && now <= PROMO.end;
};
