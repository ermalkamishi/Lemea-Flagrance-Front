// Helper utility for dynamic perfume ratings and reviews

const SAMPLE_REVIEWS = [
  {
    name: "Elvira K.",
    rating: 5,
    comment: "Aroma është e mrekullueshme, tërheqëse dhe zgjat gjatë gjithë ditën! Paketimi ishte shumë elegant.",
    dateOffsetDays: 2
  },
  {
    name: "Arjan M.",
    rating: 5,
    comment: "Parfum 100% origjinal! Erë shumë elegante dhe e fortë. Dërgesa erdhi brenda 24 orëve.",
    dateOffsetDays: 5
  },
  {
    name: "Sara D.",
    rating: 5,
    comment: "Më pëlqen pafund! Aromë e freskët dhe sensuale. Me siguri do të porosis përsëri.",
    dateOffsetDays: 9
  },
  {
    name: "Elena P.",
    rating: 4,
    comment: "Прекрасен мирис! Идеално за секојдневна употреба, многу сум задоволна од купувањето.",
    dateOffsetDays: 14
  },
  {
    name: "Besnik S.",
    rating: 5,
    comment: "Kualitet i lartë dhe shërbim taksativisht korrekt. Të gjithë më pyesin se çfarë arome kam vënë!",
    dateOffsetDays: 18
  }
];

function stringHash(str) {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns effective rating and review count for a product.
 * If database already has rating > 0, returns database values.
 * Otherwise, generates an authentic baseline rating (4.6 - 5.0) and review count.
 */
export function getProductRatingInfo(product) {
  if (!product) return { rating: 4.8, count: 12 };

  const dbRating = Number(product.rating);
  const dbCount = Number(product.reviewsCount);

  if (dbRating > 0 && dbCount > 0) {
    return {
      rating: dbRating,
      count: dbCount
    };
  }

  // Generate deterministic rating based on product ID / name
  const seed = stringHash(String(product.id || product.name || 'lemea'));
  
  // Ratings range between 4.6 and 5.0
  const ratingChoices = [4.6, 4.7, 4.8, 4.9, 5.0];
  const rating = ratingChoices[seed % ratingChoices.length];

  // Counts range between 8 and 46
  const countChoices = [14, 22, 28, 35, 42, 19, 31, 48];
  const count = countChoices[seed % countChoices.length];

  return { rating, count };
}

/**
 * Returns initial sample customer reviews if live API database has no reviews yet.
 */
export function getFallbackReviews(product) {
  if (!product) return SAMPLE_REVIEWS.slice(0, 3);
  
  const seed = stringHash(String(product.id || product.name));
  const count = 2 + (seed % 3); // 2 to 4 reviews
  const now = Date.now();

  return SAMPLE_REVIEWS.slice(0, count).map((rev, idx) => ({
    id: `fallback-${product.id}-${idx}`,
    name: rev.name,
    rating: rev.rating,
    comment: rev.comment,
    createdAt: new Date(now - (rev.dateOffsetDays + idx * 3) * 86400000).toISOString()
  }));
}
