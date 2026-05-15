import { createSlice } from '@reduxjs/toolkit';

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
export const selectCartTotals = (state) => {
  const items = state.cart.items;
  
  // 1. Calculate raw subtotal
  const subtotal = items.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return acc + price * item.quantity;
  }, 0);

  // 2. Offer Logic: 3 Body Mists for 999 Den
  // One mist is 499 Den. 3 would be 1497. Discount = 1497 - 999 = 498 per group of 3.
  const mistItems = items.filter(item => item.category === 'Body Mist');
  const totalMistQty = mistItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const numGroupsOf3 = Math.floor(totalMistQty / 3);
  const discount = numGroupsOf3 * 498;

  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    count: items.reduce((acc, item) => acc + item.quantity, 0)
  };
};

export default cartSlice.reducer;