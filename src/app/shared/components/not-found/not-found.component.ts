import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="icon">🌾</div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="actions">
          <button class="btn btn-primary" (click)="goHome()">Go to Homepage</button>
          <button class="btn btn-secondary" (click)="goBack()">Go Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      padding: 20px;
    }
    .not-found-content {
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
      font-size: 72px;
      margin: 0;
      font-weight: bold;
    }
    h2 {
      color: #666;
      margin: 10px 0 15px;
      font-size: 28px;
    }
    p {
      color: #999;
      margin-bottom: 30px;
      font-size: 16px;
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
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/homepage']);
  }

  goBack() {
    window.history.back();
  }
}
