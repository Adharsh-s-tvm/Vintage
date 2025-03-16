import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    wishlistItems: [],
    loading: false,
    error: null
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlistItems: (state, action) => {
            state.wishlistItems = action.payload;
        },
        addToWishlist: (state, action) => {
            state.wishlistItems.push(action.payload);
        },
        removeFromWishlist: (state, action) => {
            state.wishlistItems = state.wishlistItems.filter(
                item => item.variant._id !== action.payload
            );
        },
        clearWishlist: (state) => {
            state.wishlistItems = [];
        }
    }
});

export const {
    setWishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
