import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// makeStore factory pattern — required for Server Components / App Router
// Each request gets its own store instance; no shared state across requests
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
