import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface AppCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  buttonClass: string;
  action: () => void;
}

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="control-container">
      <div class="header">
        <h1>Intrad Multi-App Control Center</h1>
        <div class="user-info" *ngIf="currentUser">
          <span>{{currentUser.email}} ({{currentUser.role}})</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div *ngIf="!currentUser" class="login-prompt">
        <h2>Access Control System</h2>
        <p>Please login to access the multi-app dashboard</p>
        <button (click)="goToLogin()" class="login-btn">Login to Continue</button>
      </div>
      
      <div *ngIf="currentUser" class="app-grid">
        <div 
          *ngFor="let app of availableApps" 
          class="app-card"
          [class]="app.id + '-card'">
          <div class="app-icon">{{app.icon}}</div>
          <h3>{{app.title}}</h3>
          <p>{{app.description}}</p>
          <button 
            (click)="app.action()" 
            class="app-btn"
            [class]="app.buttonClass">
            {{app.buttonText}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .control-container { min-height: 100vh; background: #f8f9fa; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #343a40; color: white; }
    .user-info { display: flex; align-items: center; gap: 15px; }
    .logout-btn { background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    .login-prompt { text-align: center; padding: 60px 20px; }
    .login-btn { background: #007bff; color: white; padding: 15px 30px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer; }
    .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .app-card { background: white; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .app-icon { font-size: 48px; margin-bottom: 20px; }
    .app-btn { padding: 12px 24px; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px; }
    .fpc-btn { background: #28a745; color: white; }
    .apu-btn { background: #007bff; color: white; }
    .admin-btn { background: #6f42c1; color: white; }
  `]
})
export class AppControlComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentUser: User | null = null;
  availableApps: AppCard[] = [];

  private readonly appConfigs: AppCard[] = [
    {
      id: 'fpc',
      title: 'FPC System',
      description: 'Farmer Producer Company Management',
      icon: '🌾',
      buttonText: 'Launch FPC',
      buttonClass: 'fpc-btn',
      action: () => this.launchApp('fpc')
    },
    {
      id: 'apu',
      title: 'APU System', 
      description: 'Agricultural Processing Unit',
      icon: '🏭',
      buttonText: 'Launch APU',
      buttonClass: 'apu-btn',
      action: () => this.launchApp('apu')
    },
    {
      id: 'admin',
      title: 'Admin Portal',
      description: 'System Administration',
      icon: '⚙️',
      buttonText: 'Launch Admin',
      buttonClass: 'admin-btn',
      action: () => this.launchAdmin()
    }
  ];

  constructor(
    private readonly authService: AuthService, 
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateAvailableApps();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateAvailableApps(): void {
    if (!this.currentUser) {
      this.availableApps = [];
      return;
    }

    this.availableApps = this.appConfigs.filter(app => {
      switch (app.id) {
        case 'fpc': return this.authService.isAuthenticated();
        case 'apu': return this.hasRole('admin') || this.hasRole('farmer');
        case 'admin': return this.hasRole('admin');
        default: return false;
      }
    });
  }

  private hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  launchApp(appId: string): void {
    switch(appId) {
      case 'fpc':
        this.router.navigate(['/homepage']);
        break;
      case 'apu':
        this.router.navigate(['/apu-dashboard']);
        break;
      default:
        this.router.navigate([`/${appId}`]);
    }
  }

  launchAdmin(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/homepage']);
  }
}