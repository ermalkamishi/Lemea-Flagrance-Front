import { createSlice, createSelector } from '@reduxjs/toolkit';

// Helper to load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('lemea_cart');
    return savedCart ? JSON.parse(savedCart) : [];
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
    setCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
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

export const { addToCart, setCartItemQuantity, removeFromCart, clearCart } = cartSlice.actions;

// Selector for totals with discount logic
const selectCartItems = (state) => state.cart.items;

export const selectCartTotals = createSelector(
  [selectCartItems],
  (items) => {
    // 1. Calculate raw subtotal
    const subtotal = items.reduce((acc, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      return acc + price * item.quantity;
    }, 0);

    // 2. Perfume + Body Mist Offer pairing logic
    // Perfumes are in categories 'Parfume' or 'Për meshkuj'
    const perfumeItems = items.filter(item => item.category === 'Parfume' || item.category === 'Për meshkuj');
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

    // Check if the promotion is still active (ends June 4, 2026, 23:59:59+02:00)
    const PROMO_END_TIME = new Date('2026-06-04T23:59:59+02:00').getTime();
    const isPromoActive = new Date().getTime() < PROMO_END_TIME;

    // Count how many body mists can be free (only if promo is active!)
    const freeMistsCount = isPromoActive ? Math.min(perfumeQty, allMistPrices.length) : 0;
    
    // Calculate perfume + mist discount (sum of the cheapest free mists)
    let perfumeMistDiscount = 0;
    for (let i = 0; i < freeMistsCount; i++) {
      perfumeMistDiscount += allMistPrices[i];
    }

    // 3. Offer Logic: 3 Body Mists for 999 Den (for the remaining non-free body mists!)
    // One mist is 499 Den. 3 would be 1497. Discount = 1497 - 999 = 498 per group of 3.
    const remainingMistsCount = allMistPrices.length - freeMistsCount;
    const numGroupsOf3 = Math.floor(remainingMistsCount / 3);
    const groupsOf3Discount = numGroupsOf3 * 498;

    const discount = perfumeMistDiscount + groupsOf3Discount;
    const total = subtotal - discount;

    return {
      subtotal,
      discount,
      perfumeMistDiscount,
      groupsOf3Discount,
      total,
      count: items.reduce((acc, item) => acc + item.quantity, 0)
    };
  }
);

export default cartSlice.reducer;