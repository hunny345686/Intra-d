import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtpService } from '../../services/otp.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="otp-container" *ngIf="showOtpModal">
      <div class="otp-modal">
        <h4>Verify Mobile Number</h4>
        <p>Enter the OTP sent to {{mobileNumber}}</p>
        
        <div class="otp-input-group">
          <input 
            type="text" 
            [(ngModel)]="otpCode" 
            maxlength="6" 
            placeholder="Enter 6-digit OTP"
            class="form-control">
        </div>
        
        <div class="otp-actions">
          <button 
            class="btn btn-primary" 
            (click)="verifyOtp()"
            [disabled]="isVerifying || otpCode.length !== 6">
            {{isVerifying ? 'Verifying...' : 'Verify'}}
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="resendOtp()"
            [disabled]="isResending">
            {{isResending ? 'Sending...' : 'Resend OTP'}}
          </button>
          <button class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
        </div>
        
        <div *ngIf="message" class="alert" [class]="'alert-' + messageType">
          {{message}}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .otp-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .otp-modal {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
    }
    .otp-input-group {
      margin: 1rem 0;
    }
    .otp-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .otp-actions button {
      flex: 1;
      min-width: 80px;
    }
  `]
})
export class OtpVerificationComponent {
  @Input() mobileNumber: string = '';
  @Input() showOtpModal: boolean = false;
  @Output() otpVerified = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<void>();

  otpCode: string = '';
  isVerifying: boolean = false;
  isResending: boolean = false;
  message: string = '';
  messageType: 'success' | 'danger' = 'danger';

  constructor(private otpService: OtpService) {}

  verifyOtp(): void {
    if (this.otpCode.length !== 6) return;
    
    this.isVerifying = true;
    this.message = '';
    
    this.otpService.verifyOtp(this.mobileNumber, this.otpCode).subscribe({
      next: (isValid) => {
        this.isVerifying = false;
        if (isValid) {
          this.message = 'Mobile number verified successfully!';
          this.messageType = 'success';
          setTimeout(() => {
            this.otpVerified.emit(true);
            this.closeModal();
          }, 1000);
        } else {
          this.message = 'Invalid OTP. Please try again.';
          this.messageType = 'danger';
        }
      },
      error: () => {
        this.isVerifying = false;
        this.message = 'Verification failed. Please try again.';
        this.messageType = 'danger';
      }
    });
  }

  resendOtp(): void {
    this.isResending = true;
    this.message = '';
    
    this.otpService.sendOtp(this.mobileNumber).subscribe({
      next: () => {
        this.isResending = false;
        this.message = 'OTP sent successfully!';
        this.messageType = 'success';
      },
      error: () => {
        this.isResending = false;
        this.message = 'Failed to send OTP. Please try again.';
        this.messageType = 'danger';
      }
    });
  }

  closeModal(): void {
    this.showOtpModal = false;
    this.otpCode = '';
    this.message = '';
    this.modalClosed.emit();
  }
}