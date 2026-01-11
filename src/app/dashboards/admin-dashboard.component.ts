import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BuyerComponent } from '../APU/buyer/buyer.component';
import { SellerComponent } from '../APU/seller/seller.component';
import { HomepageComponent } from '../FPC/Homepage/homepage.component';
import { APP_CONSTANTS } from '../constants';

type TabType = 'fpc' | 'buyer' | 'seller';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BuyerComponent, SellerComponent, HomepageComponent],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h2>Admin Dashboard - Full Access</h2>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </header>
      
      <nav class="dashboard-tabs">
        <button 
          *ngFor="let tab of tabs" 
          (click)="setActiveTab(tab.id)" 
          [class.active]="activeTab === tab.id"
          class="tab-btn">
          {{tab.label}}
        </button>
      </nav>
      
      <main class="tab-content">
        <app-homepage *ngIf="activeTab === 'fpc'"></app-homepage>
        <app-buyer *ngIf="activeTab === 'buyer'"></app-buyer>
        <app-seller *ngIf="activeTab === 'seller'"></app-seller>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container { min-height: 100vh; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #6f42c1; color: white; }
    .logout-btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .dashboard-tabs { display: flex; gap: 10px; padding: 20px; background: #f8f9fa; }
    .tab-btn { padding: 10px 20px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
    .tab-btn.active { background: #6f42c1; color: white; }
    .tab-content { padding: 20px; }
  `]
})
export class AdminDashboardComponent {
  activeTab: TabType = 'fpc';
  
  readonly tabs = [
    { id: 'fpc' as TabType, label: 'FPC System' },
    { id: 'buyer' as TabType, label: 'Buyer Form' },
    { id: 'seller' as TabType, label: 'Seller Form' }
  ];

  constructor(
    private readonly authService: AuthService, 
    private readonly router: Router
  ) {}

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([APP_CONSTANTS.ROUTES.HOME]);
  }
}