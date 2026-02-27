import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer, { type AuthState, initialAuthState } from "./authSlice";
import adoptionReducer from "./adoptionSlice";
import adoptionRequestsReducer from "./adoptionRequestsSlice";
import petReducer from "./petSlice";
import usersReducer from "./usersSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  adoption: adoptionReducer,
  adoptionRequests: adoptionRequestsReducer,
  pet: petReducer,
  users: usersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const loadAuthFromStorage = (): AuthState | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const savedAuth = window.localStorage.getItem("auth");
  if (!savedAuth) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(savedAuth);
    if (parsed?.user && parsed?.tokens) {
      return {
        ...initialAuthState,
        user: parsed.user,
        tokens: parsed.tokens,
      };
    }
  } catch {
    // Ignore invalid storage contents.
  }

  return undefined;
};

const preloadedAuth = loadAuthFromStorage();
const preloadedState = preloadedAuth
  ? ({ auth: preloadedAuth } as Partial<RootState>)
  : undefined;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

export type AppDispatch = typeof store.dispatch;
