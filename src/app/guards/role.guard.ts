import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/homepage']);
      return false;
    }

    // Admin has access to everything
    if (this.authService.hasRole('admin')) {
      return true;
    }

    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      this.router.navigate(['/homepage']);
      return false;
    }

    return true;
  }
}