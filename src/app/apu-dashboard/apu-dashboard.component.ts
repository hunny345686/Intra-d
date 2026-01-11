import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BuyerComponent } from '../APU/buyer/buyer.component';
import { SellerComponent } from '../APU/seller/seller.component';

type TabType = 'buyer' | 'seller';

@Component({
  selector: 'app-apu-dashboard',
  standalone: true,
  imports: [CommonModule, BuyerComponent, SellerComponent],
  template: `
    <div class="apu-dashboard">
      <header class="header">
        <button (click)="goBack()" class="back-btn">← Back to Control</button>
        <h2>APU System</h2>
      </header>
      
      <nav class="nav-tabs">
        <button 
          *ngFor="let tab of tabs"
          (click)="setActiveTab(tab.id)" 
          [class.active]="activeTab === tab.id"
          class="tab-btn">
          {{tab.label}}
        </button>
      </nav>
      
      <main class="tab-content">
        <app-buyer *ngIf="activeTab === 'buyer'"></app-buyer>
        <app-seller *ngIf="activeTab === 'seller'"></app-seller>
      </main>
    </div>
  `,
  styles: [`
    .header { display: flex; align-items: center; margin-bottom: 20px; padding: 20px; background: #f8f9fa; }
    .back-btn { background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 20px; }
    .nav-tabs { display: flex; margin-bottom: 20px; padding: 0 20px; }
    .tab-btn { padding: 10px 20px; border: 1px solid #ccc; background: #f8f9fa; cursor: pointer; margin-right: 5px; border-radius: 4px; }
    .tab-btn.active { background: #007bff; color: white; }
    .tab-content { padding: 0 20px; }
  `]
})
export class ApuDashboardComponent {
  activeTab: TabType = 'buyer';
  
  readonly tabs = [
    { id: 'buyer' as TabType, label: 'Buyer' },
    { id: 'seller' as TabType, label: 'Seller' }
  ];

  @Output() backToControl = new EventEmitter<void>();

  constructor(private router: Router) {}

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/control']);
  }
}