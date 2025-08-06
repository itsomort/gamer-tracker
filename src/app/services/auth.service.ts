import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  status: number;
  token: string;
  message?: string;
}

export interface User {
  username: string;
  email?: string;
  userType?: number; // 0 = regular user, 1 = admin
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login user and get JWT token
   */
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/user/login', {
      username: username,
      password: password
    });
  }

  /**
   * Register new user and get JWT token
   */
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/user/register', {
      username: username,
      email: email,
      password: password
    });
  }

  /**
   * Store JWT token and user info
   */
  setToken(token: string, user: User): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // SSR environment
    }
    
    // Extract user type from token if not provided in user object
    try {
      if (user.userType === undefined) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user.userType = payload.userType || 0;
      }
    } catch (error) {
      console.warn('Could not extract user type from token:', error);
      user.userType = 0; // Default to regular user
    }
    
    console.log('JWT token stored successfully');
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null; // SSR environment
    }
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get current user info
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null; // SSR environment
    }
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user has valid token
   */
  hasToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 1;
  }

  /**
   * Get user type from token
   */
  getUserType(): number {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 0; // SSR environment, default to regular user
    }
    
    const token = this.getToken();
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userType || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if user is authenticated (observable)
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem('username'); // Clean up old storage
      localStorage.removeItem('password'); // Clean up old storage
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  /**
   * Get authorization header for API calls
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    if (token) {
      console.log('Using JWT token for API call');
      return { 'Authorization': `Bearer ${token}` };
    }
    console.log('No JWT token available');
    return {};
  }

  /**
   * Debug JWT token information (call from browser console)
   */
  debugToken(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const hasValidToken = this.hasToken();
    
    console.group('JWT Token Debug Info');
    console.log('Has Token:', hasValidToken);
    console.log('Current User:', user);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token Payload:', payload);
        console.log('Token Expires:', new Date(payload.exp * 1000).toLocaleString());
        console.log('Token Valid:', payload.exp > (Date.now() / 1000));
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    console.groupEnd();
  }
}
