import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
};

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ accessToken: string; user?: unknown }>,
    ) {
      state.accessToken = action.payload.accessToken;
    },
    clearAuth(state) {
      state.accessToken = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
