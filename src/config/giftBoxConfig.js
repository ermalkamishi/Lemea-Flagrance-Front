// ============================================================
// GIFT BOX PROMO
// The customer builds a box from exactly one product of each slot below.
// A completed box costs GIFT_BOX.price, and an order that contains ONLY
// gift boxes ships for free.
// ============================================================

export const GIFT_BOX = {
  price: 2499,
  size: 4,
};

const lower = (v) => String(v || '').toLowerCase();

const isMist = (p) => {
  const c = lower(p.category);
  return c.includes('mist') || c.includes('body');
};

const isSheglam = (p) => lower(p.brand).includes('sheglam') || lower(p.name).includes('sheglam');

/**
 * The four slots of the box. A product belongs to the first slot whose
 * `match` returns true. Primers and blushes share the "Sheglam" category,
 * so they are told apart by product name.
 */
export const GIFT_BOX_SLOTS = [
  {
    key: 'vs_mist',
    label: { sq: "Victoria's Secret Body Mist", mk: "Victoria's Secret Body Mist" },
    short: 'Victoria Secret',
    match: (p) =>
      isMist(p) &&
      (lower(p.brand).includes('victoria') || lower(p.name).includes('victoria') || lower(p.name).startsWith('vs ')),
  },
  {
    key: 'sdj_mist',
    label: { sq: 'Sol de Janeiro Body Mist', mk: 'Sol de Janeiro Body Mist' },
    short: 'Sol de Janeiro',
    match: (p) =>
      isMist(p) && (lower(p.brand).includes('sol de janeiro') || lower(p.name).includes('sol de janeiro') || lower(p.name).includes('cheirosa')),
  },
  {
    key: 'sheglam_primer',
    label: { sq: 'Sheglam Eyeshadow Primer', mk: 'Sheglam Eyeshadow Primer' },
    short: 'Sheglam Primer',
    match: (p) => isSheglam(p) && lower(p.name).includes('primer'),
  },
  {
    key: 'sheglam_blush',
    label: { sq: 'Sheglam Blush', mk: 'Sheglam Blush' },
    short: 'Sheglam Blush',
    match: (p) => isSheglam(p) && lower(p.name).includes('blush'),
  },
];

/** Returns the slot key a product belongs to, or null if it can't go in the box. */
export const getGiftBoxSlot = (product) => {
  if (!product) return null;
  const slot = GIFT_BOX_SLOTS.find((s) => s.match(product));
  return slot ? slot.key : null;
};

export const GIFT_BOX_ROUTE = '/produktet/gift-box';
