import type { AuthUser } from '../index';

export const AuthMessagePatterns = {
  UserGetById: 'auth.user.get_by_id'
} as const;

export interface AuthUserGetByIdRequest {
  userId: string;
}

export interface AuthUserGetByIdResponse {
  user: AuthUser | null;
}
