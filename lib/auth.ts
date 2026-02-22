// JWT Token Management
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  email: string;
  tenant_id?: string;
  tenant_name?: string;
  role?: string;
}

const ACCESS_TOKEN_KEY = 'chatbot_access_token';
const REFRESH_TOKEN_KEY = 'chatbot_refresh_token';
const USER_KEY = 'chatbot_user';

export const auth = {
  // Get access token from localStorage
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Get refresh token from localStorage
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Store tokens in localStorage
  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  // Store user info
  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get stored user info
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear all auth data
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!auth.getAccessToken();
  },
};
