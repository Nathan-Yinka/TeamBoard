import type { AuthResponse, AuthUser } from '@teamboard/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../services/apiClient';
import { tokenStorage } from './tokenStorage';

export type AuthStatus = 'anonymous' | 'loading' | 'authenticated';

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: AuthStatus;
}

const storedToken = tokenStorage.read();

if (storedToken) {
  apiClient.setToken(storedToken);
}

const initialState: AuthState = {
  token: storedToken,
  user: null,
  status: storedToken ? 'loading' : 'anonymous'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>): void {
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = 'authenticated';
      tokenStorage.write(action.payload.accessToken);
      apiClient.setToken(action.payload.accessToken);
    },
    setUser(state, action: PayloadAction<AuthUser>): void {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    clearAuth(state): void {
      state.token = null;
      state.user = null;
      state.status = 'anonymous';
      tokenStorage.clear();
      apiClient.setToken(null);
    },
    markAnonymous(state): void {
      state.status = 'anonymous';
    }
  }
});

export const { clearAuth, markAnonymous, setCredentials, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
