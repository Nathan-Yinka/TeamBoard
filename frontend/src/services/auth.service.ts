import type { AuthResponse, AuthUser } from '@teamboard/shared';
import { apiClient } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  signup(payload: SignupRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse, SignupRequest>('/auth/signup', payload);
  },
  login(payload: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse, LoginRequest>('/auth/login', payload);
  },
  me(): Promise<AuthUser> {
    return apiClient.get<AuthUser>('/auth/me');
  }
};
