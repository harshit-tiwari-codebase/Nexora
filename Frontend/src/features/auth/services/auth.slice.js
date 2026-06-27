import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setUser, setError, setLoading , setInitialized } = authSlice.actions;

export default authSlice.reducer;
