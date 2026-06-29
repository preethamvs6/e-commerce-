import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    addToWishlistLocal: (state, action) => {
      if (!state.items.find(item => item.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlistLocal: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearWishlistLocal: (state) => {
      state.items = [];
    }
  },
});

export const { setWishlist, addToWishlistLocal, removeFromWishlistLocal, clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
