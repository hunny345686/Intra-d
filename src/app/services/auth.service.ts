import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  location?: string;
  profileData?: any;
}

interface LoginCredentials {
  email: string;
  password: string;
  csrfToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  private sessionTimeout: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.checkAuthStatus();
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    try {
      const user = this.validateUser(credentials);
      if (user) {
        this.setCurrentUser(user);
        this.startSessionTimeout();
        return of(true);
      }
      return of(false);
    } catch (error) {
      console.error('Login error:', error);
      return of(false);
    }
  }

  validateFirebaseUser(email: string, password: string, firebaseUsers: any): User | null {
    try {
      if (!firebaseUsers) return null;
      
      for (const userId in firebaseUsers) {
        const userContainer = firebaseUsers[userId];
        for (const firebaseKey in userContainer) {
          const user = userContainer[firebaseKey];
          if (user?.email === email && user?.password === password) {
            return { 
              id: user.userId || userId, 
              email: user.email, 
              role: user.role || 'farmer',
              name: user.name || user.firstName + ' ' + (user.lastName || ''),
              phone: user.phone || user.phoneNumber,
              location: user.location || user.address,
              profileData: user
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Firebase user validation error:', error);
      return null;
    }
  }

  private validateUser({ email, password }: LoginCredentials): User | null {
    try {
      const users = [
        { id: '1', email: 'admin@intrad.com', password: 'admin123', role: 'admin' },
        { id: '2', email: 'farmer@intrad.com', password: 'farmer123', role: 'farmer' },
        { id: '3', email: 'user@intrad.com', password: 'user123', role: 'user' }
      ];
      
      const foundUser = users.find(u => u.email === email && u.password === password);
      return foundUser ? { id: foundUser.id, email: foundUser.email, role: foundUser.role } : null;
    } catch (error) {
      console.error('User validation error:', error);
      return null;
    }
  }

  setCurrentUser(user: User): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  logout(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
      }
      this.clearSessionTimeout();
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  private checkAuthStatus(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          this.startSessionTimeout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  private startSessionTimeout(): void {
    this.clearSessionTimeout();
    this.sessionTimeout = setTimeout(() => {
      this.logout();
    }, 30 * 60 * 1000); // 30 minutes
  }

  private clearSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }
}