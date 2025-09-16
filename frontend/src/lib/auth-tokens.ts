/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TokenData {
  accessToken: string;
  expiresAt: number;
  tokenType?: string;
}

export interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
  email: string;
  fullname: string;
  [key: string]: any;
}

const TOKEN_STORAGE_KEY = 'auth_tokens';
const TOKEN_EXPIRY_BUFFER = 60 * 1000;

export class TokenManager {

  /**
   * Store tokens in localStorage
   */
  static setTokens(tokens: TokenData): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get tokens from localStorage
   */
  static getTokens(): TokenData | null {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) return null;

      const tokens: TokenData = JSON.parse(stored);
      return tokens;
    } catch (error) {
      console.error('Failed to parse stored tokens:', error);
      return null;
    }
  }

  /**
   * Remove tokens from localStorage
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Check if access token exists and is valid
   */
  static isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    return !this.isTokenExpired(tokens.accessToken);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      const now = Date.now();
      const expiresAt = decoded.exp * 1000;

      return now >= (expiresAt - TOKEN_EXPIRY_BUFFER);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true;
    }
  }

  /**
   * Decode JWT token (client-side only for expiry check)
   */
  static decodeToken(token: string): DecodedToken {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {

      throw new Error('Invalid token format');
    }
  }

  /**
   * Get access token if valid
   */
  static getValidAccessToken(): string | null {
    const tokens = this.getTokens();
    if (!tokens) return null;

    if (this.isTokenExpired(tokens.accessToken)) {
      return null;
    }

    return tokens.accessToken;
  }

  /**
   * Get user info from token
   */
  static getUserFromToken(): DecodedToken | null {
    const token = this.getValidAccessToken();
    if (!token) return null;

    try {
      return this.decodeToken(token);
    } catch (error) {
      return null;
    }
  }



}