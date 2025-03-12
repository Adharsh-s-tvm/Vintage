import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')) : null,
    isAuthenticated: localStorage.getItem('userInfo') ? true : false,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setAdminInfo: (state, action) => {
            state.data = action.payload;
            state.isAuthenticated = true;
        },
        clearAdminInfo: (state) => {
            state.data = null;
            state.isAuthenticated = false;
            // Clear localStorage
            localStorage.removeItem('userInfo');
            localStorage.removeItem('jwt');
        },
    },
});

export const { setAdminInfo, clearAdminInfo } = adminSlice.actions;
export default adminSlice.reducer;