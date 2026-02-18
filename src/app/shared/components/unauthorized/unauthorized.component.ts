import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p class="sub-text">Please contact your administrator if you believe this is an error.</p>
        <div class="actions">
          <button class="btn btn-primary" (click)="goToDashboard()">Go to Dashboard</button>
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .unauthorized-content {
      background: white;
      padding: 60px 40px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 500px;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 15px;
      font-size: 32px;
    }
    p {
      color: #666;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .sub-text {
      font-size: 14px;
      color: #999;
      margin-bottom: 30px;
    }
    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #28a745;
      color: white;
    }
    .btn-primary:hover {
      background: #218838;
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }
  `]
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goToDashboard() {
    const dashboardRoute = this.authService.getDashboardRoute();
    this.router.navigate([dashboardRoute]);
  }

  logout() {
    this.authService.logout('/homepage');
  }
}
