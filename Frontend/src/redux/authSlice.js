import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    admin: null,
    loading: false,
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
    },
  },
});

export const { setAdmin, setLoading, setAuthenticated } = authSlice.actions;

export default authSlice.reducer;
