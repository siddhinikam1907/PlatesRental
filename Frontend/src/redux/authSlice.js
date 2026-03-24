import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    admin: null,
    loading: true, // ✅ important
    isAuthenticated: false,
  },

  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAdmin: (state, action) => {
      state.admin = action.payload;
    },

    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      state.loading = false; // ✅ stop loading after auth check
    },
  },
});

export const { setAdmin, setLoading, setAuthenticated } = authSlice.actions;

export default authSlice.reducer;
