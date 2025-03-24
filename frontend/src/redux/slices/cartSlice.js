import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload.items;
      state.subtotal = action.payload.items.reduce((sum, item) => {
        const price = item.variant.discountPrice && 
                     item.variant.discountPrice > 0 && 
                     item.variant.discountPrice < item.variant.price 
                       ? item.variant.discountPrice 
                       : item.variant.price;
        return sum + (price * item.quantity);
      }, 0);
      state.shipping = action.payload.shipping || 0;
      state.total = state.subtotal + state.shipping;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.subtotal = 0;
      state.shipping = 0;
      state.total = 0;
    }
  }
});

export const { setCartItems, setLoading, setError, clearCart } = cartSlice.actions;
export default cartSlice.reducer;