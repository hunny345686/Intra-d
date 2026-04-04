import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-apu-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="apu-dashboard-container">
      <div class="dashboard-header">
        <button class="btn btn-outline-secondary mb-3" (click)="backToControl()" *ngIf="isAdmin()">
          <i class="bi bi-arrow-left"></i> Back to Control
        </button>
        <h1 class="text-center mb-2">Agricultural Processing Unit (APU)</h1>
        <p class="text-center text-muted mb-4">Choose your service</p>
      </div>

      <div class="row g-4 justify-content-center">
        <div class="col-md-5">
          <div class="service-card buyer-card" (click)="navigateToBuyer()">
            <div class="service-icon">🛒</div>
            <h2>Buyer Portal</h2>
            <p>Looking to purchase agricultural products? Submit your requirements and connect with sellers.</p>
            <button class="btn btn-primary btn-lg w-100">
              <i class="bi bi-cart-check me-2"></i>Go to Buyer Form
            </button>
          </div>
        </div>

        <div class="col-md-5">
          <div class="service-card seller-card" (click)="navigateToSeller()">
            <div class="service-icon">📦</div>
            <h2>Seller Portal</h2>
            <p>Have agricultural products to sell? List your offerings and reach potential buyers.</p>
            <button class="btn btn-success btn-lg w-100">
              <i class="bi bi-box-seam me-2"></i>Go to Seller Form
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .apu-dashboard-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .dashboard-header {
      max-width: 1200px;
      margin: 0 auto 3rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      font-weight: 700;
      font-size: 2.5rem;
    }

    .row {
      max-width: 1200px;
      margin: 0 auto;
    }

    .service-card {
      background: white;
      border-radius: 20px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      height: 100%;
    }

    .service-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }

    .buyer-card:hover {
      border: 2px solid #007bff;
    }

    .seller-card:hover {
      border: 2px solid #28a745;
    }

    .service-icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
    }

    .service-card h2 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .service-card p {
      color: #6c757d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .btn {
      border-radius: 50px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: scale(1.05);
    }
  `]
})
export class ApuDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  navigateToBuyer() {
    this.router.navigate(['/apu/buyer']);
  }

  navigateToSeller() {
    this.router.navigate(['/apu/seller']);
  }

  backToControl() {
    this.router.navigate(['/control']);
  }
}
