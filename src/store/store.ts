import { configureStore } from "@reduxjs/toolkit";
import { AuthenticationApi } from "./apis/auth/authentication.api";
import AuthSlice from "@/store/slices/authslice";

import themeSlice from "@/store/slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: AuthSlice,
    theme: themeSlice,
    [AuthenticationApi.reducerPath]: AuthenticationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(AuthenticationApi.middleware),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
