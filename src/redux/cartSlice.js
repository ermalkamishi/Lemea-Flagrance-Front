import { createSlice, createSelector } from '@reduxjs/toolkit';
import { GIFT_BOX } from '../config/giftBoxConfig';

// Helper to load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('lemea_cart');
    const items = savedCart ? JSON.parse(savedCart) : [];
    // Keep saved gift boxes in sync with the current gift box price
    return items.map((item) => (item.isGiftBox ? { ...item, price: GIFT_BOX.price } : item));
  } catch (e) {
    return [];
  }
};

// Helper to save cart to localStorage
const saveCartToStorage = (items) => {
  localStorage.setItem('lemea_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      let price = product.price;
      if (typeof price === 'string') {
        price = parseFloat(price.replace(/,/g, '').replace(/[^\d.]/g, ''));
      }

      if (!price && product.newPrice) {
        price = parseFloat(String(product.newPrice).replace(/,/g, '').replace(/[^\d.]/g, ''));
      }

      if (isNaN(price)) price = 0;

      const qtyToAdd =
        typeof product.quantity === 'number' && product.quantity > 0
          ? Math.floor(product.quantity)
          : 1;

      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += qtyToAdd;
      } else {
        state.items.push({ ...product, price, quantity: qtyToAdd });
      }
      saveCartToStorage(state.items);
    },
    // Adds a completed gift box as ONE cart line. payload.products = the 4 chosen products.
    addGiftBox: (state, action) => {
      const products = Array.isArray(action.payload?.products) ? action.payload.products : [];
      if (products.length !== GIFT_BOX.size) return;
      state.items.push({
        id: `giftbox-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isGiftBox: true,
        name: 'Gift Box',
        brand: 'Lemea',
        price: GIFT_BOX.price,
        quantity: 1,
        image: products[0]?.image,
        boxItems: products.map((p) => ({
          productId: p.id,
          name: p.name,
          image: p.image,
          slot: p.slot,
        })),
      });
      saveCartToStorage(state.items);
    },
    setCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (!item || item.isGiftBox) return;
      const next = Math.max(1, Math.floor(Number(quantity)) || 1);
      item.quantity = next;
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    }
  }
});

export const { addToCart, addGiftBox, setCartItemQuantity, removeFromCart, clearCart } = cartSlice.actions;

// Selector for totals with discount logic
const selectCartItems = (state) => state.cart.items;

export const selectCartTotals = createSelector(
  [selectCartItems],
  (allItems) => {
    // Gift boxes have a fixed price and never stack with other offers,
    // so every promo below only looks at the regular (non-box) items.
    const giftBoxes = allItems.filter((item) => item.isGiftBox);
    const items = allItems.filter((item) => !item.isGiftBox);
    const giftBoxCount = giftBoxes.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const giftBoxTotal = giftBoxes.reduce((acc, item) => acc + GIFT_BOX.price * (item.quantity || 1), 0);

    // Check if the 5-day promotion is active
    // We import the config to check the dates. But since this is Redux, 
    // it's safer to just check here inline to avoid circular dependencies.
    const PROMO_START = new Date('2026-06-18T00:00:00+02:00').getTime();
    const PROMO_END = new Date('2026-06-23T23:59:59+02:00').getTime();
    const now = Date.now();
    const isPromoActive = now >= PROMO_START && now <= PROMO_END;
    const PERFUME_PROMO_PRICE = 1399;

    let subtotal = 0;
    let totalPromoSavings = 0;

    // Helper to check if an item is a perfume
    const isPerfume = (category) => {
      if (!category) return false;
      const cat = category.toLowerCase();
      // Exclude blushes, lipglosses, lip care, makeup, and body mists
      return !cat.includes('body mist') && 
             !cat.includes('lipgloss') && 
             !cat.includes('blush') && 
             !cat.includes('lip care');
    };

    // 1. Calculate raw subtotal with promo override
    items.forEach((item) => {
      let price = typeof item.price === 'number' ? item.price : 0;
      
      // Override price if promo is active and it's a perfume
      if (isPromoActive && isPerfume(item.category)) {
         if (price > PERFUME_PROMO_PRICE) {
           totalPromoSavings += (price - PERFUME_PROMO_PRICE) * item.quantity;
           price = PERFUME_PROMO_PRICE;
         }
      }
      subtotal += price * item.quantity;
    });

    // 2. Perfume + Body Mist Offer pairing logic
    const perfumeItems = items.filter(item => isPerfume(item.category));
    const perfumeQty = perfumeItems.reduce((acc, item) => acc + item.quantity, 0);

    const mistItems = items.filter(item => item.category === 'Body Mist');
    
    // Create an array of all individual body mist prices in the cart
    let allMistPrices = [];
    mistItems.forEach(item => {
      const price = typeof item.price === 'number' ? item.price : 0;
      for (let i = 0; i < item.quantity; i++) {
        allMistPrices.push(price);
      }
    });

    // Sort mists by price ascending (cheapest first) to apply discount to them
    allMistPrices.sort((a, b) => a - b);

    // Old promo end date (June 4)
    const OLD_PROMO_END_TIME = new Date('2026-06-04T23:59:59+02:00').getTime();
    const isOldPromoActive = now < OLD_PROMO_END_TIME;

    // Count how many body mists can be free (only if promo is active!)
    const freeMistsCount = isOldPromoActive ? Math.min(perfumeQty, allMistPrices.length) : 0;
    
    // Calculate perfume + mist discount (sum of the cheapest free mists)
    let perfumeMistDiscount = 0;
    for (let i = 0; i < freeMistsCount; i++) {
      perfumeMistDiscount += allMistPrices[i];
    }

    // 3. Offer Logic: 3 Body Mists for 999 Den (for the remaining non-free body mists!)
    const remainingMistsCount = allMistPrices.length - freeMistsCount;
    const numGroupsOf3 = Math.floor(remainingMistsCount / 3);
    const groupsOf3Discount = numGroupsOf3 * 498; // 1497 - 999 = 498

    // 4. Special Combo Offer: Victoria's Secret (499 Den) + Sol De Janeiro (699 Den) = 999 Den (Save 199 Den per pair!)
    let vsQty = 0;
    let sdjQty = 0;

    items.forEach((item) => {
      const brand = (item.brand || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const qty = item.quantity || 1;
      const isMist = cat.includes('mist') || cat.includes('body');

      const isVS = (brand.includes('victoria') || name.includes('victoria') || name.includes('vs ')) && isMist;
      const isSDJ = (brand.includes('sol') || name.includes('sol de janeiro')) && isMist;

      if (isVS) vsQty += qty;
      if (isSDJ) sdjQty += qty;
    });

    const comboPairs = Math.min(vsQty, sdjQty);
    const comboBundleDiscount = comboPairs * 199; // 1198 - 999 = 199 Den discount per pair

    const discount = perfumeMistDiscount + groupsOf3Discount + comboBundleDiscount;
    subtotal += giftBoxTotal;
    const total = Math.max(0, subtotal - discount);

    return {
      subtotal,
      discount,
      perfumeMistDiscount,
      groupsOf3Discount,
      comboBundleDiscount,
      comboPairs,
      vsQty,
      sdjQty,
      totalPromoSavings, // We'll display this in the Cart/Checkout
      total,
      giftBoxCount,
      count: allItems.reduce((acc, item) => acc + item.quantity, 0)
    };
  }
);

export default cartSlice.reducer;