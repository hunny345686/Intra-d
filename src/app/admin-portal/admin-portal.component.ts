import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-portal.component.html',
  styleUrl: './admin-portal.component.css',
})
export class AdminPortalComponent {
  // Stats Cards Data
  stats = [
    {
      label: 'Farmers',
      value: '1,284',
      unit: '',
      trend: '24 today',
      icon: 'bi-person-badge',
      color: 'success',
    },
    {
      label: 'Crops Available',
      value: '35,200',
      unit: 'Kg',
      trend: '',
      icon: 'bi-potted-plant',
      color: 'success',
    },
    {
      label: 'Urgent Crops',
      value: '6,300',
      unit: 'Kg',
      trend: '24 today',
      icon: 'bi-exclamation-triangle',
      color: 'warning',
    },
    {
      label: 'Active Buyers',
      value: '48',
      unit: '',
      trend: '',
      icon: 'bi-person-check',
      color: 'success',
    },
  ];

  // Table Data
  availableCrops = [
    { name: 'Onion', quantity: '12,500 Kg' },
    { name: 'Tomato', quantity: '8,200 Kg' },
  ];

  urgentCrops = [
    {
      name: 'Chilli',
      status: '1,800 Kg # 24 hrs',
      class: 'bg-warning-subtle text-warning',
    },
    {
      name: 'Onion',
      status: '4,500 Kg # 48 hrs',
      class: 'bg-danger-subtle text-danger',
    },
  ];

  buyerDemands = [
    { name: 'FreshMart', bid: '₹3,000', timeframe: '3 days' },
    { name: 'Tomato', bid: '₹1,500', timeframe: 'Tomorrow' },
  ];

  onMatch() {
    console.log('Matching buyer and seller...');
  }
}
