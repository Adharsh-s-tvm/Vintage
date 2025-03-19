import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import wishlistReducer from "./slices/wishlistSlice";
import cartReducer from "./slices/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    wishlist: wishlistReducer,
    cart: cartReducer
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;
