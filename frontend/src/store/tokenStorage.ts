const TOKEN_KEY = 'teamboard_token';

export const tokenStorage = {
  read(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  write(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
};
