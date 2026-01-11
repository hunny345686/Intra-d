import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string;
  unit: string;
  trend: string;
  icon: string;
  color: 'success' | 'warning' | 'danger';
}

interface CropData {
  name: string;
  quantity?: string;
  status?: string;
  class?: string;
}

interface BuyerDemand {
  name: string;
  bid: string;
  timeframe: string;
}

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-portal.component.html',
  styleUrl: './admin-portal.component.css'
})
export class AdminPortalComponent {
  readonly stats: StatCard[] = [
    { label: 'Farmers', value: '1,284', unit: '', trend: '24 today', icon: 'bi-person-badge', color: 'success' },
    { label: 'Crops Available', value: '35,200', unit: 'Kg', trend: '', icon: 'bi-potted-plant', color: 'success' },
    { label: 'Urgent Crops', value: '6,300', unit: 'Kg', trend: '24 today', icon: 'bi-exclamation-triangle', color: 'warning' },
    { label: 'Active Buyers', value: '48', unit: '', trend: '', icon: 'bi-person-check', color: 'success' }
  ];

  readonly availableCrops: CropData[] = [
    { name: 'Onion', quantity: '12,500 Kg' },
    { name: 'Tomato', quantity: '8,200 Kg' }
  ];

  readonly urgentCrops: CropData[] = [
    { name: 'Chilli', status: '1,800 Kg # 24 hrs', class: 'bg-warning-subtle text-warning' },
    { name: 'Onion', status: '4,500 Kg # 48 hrs', class: 'bg-danger-subtle text-danger' }
  ];

  readonly buyerDemands: BuyerDemand[] = [
    { name: 'FreshMart', bid: '₹3,000', timeframe: '3 days' },
    { name: 'Tomato', bid: '₹1,500', timeframe: 'Tomorrow' }
  ];

  onMatch(): void {
    console.log('Matching buyer and seller...');
    // Implementation for matching logic
  }
}
