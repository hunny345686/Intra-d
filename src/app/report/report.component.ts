import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports Dashboard</h2>
        <button class="btn btn-secondary" (click)="goBack()">
          <i class="bi bi-arrow-left"></i> Back to Admin Portal
        </button>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">System Reports</h5>
              <p class="card-text">Reports functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
  `]
})
export class ReportComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/control']);
  }
}