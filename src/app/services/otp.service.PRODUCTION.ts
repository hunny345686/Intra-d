import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// TODO: Move to environment.ts after getting MSG91 credentials
const SMS_CONFIG = {
  // Development mode - set to false in production
  isDevelopment: true,
  devOtp: '123456', // Fixed OTP for testing
  
  // MSG91 Configuration (add your credentials here)
  msg91: {
    authKey: 'YOUR_MSG91_AUTH_KEY', // Get from https://msg91.com/
    senderId: 'INTRAD',
    templateId: 'YOUR_TEMPLATE_ID',
    apiUrl: 'https://api.msg91.com/api/v5/otp'
  }
};

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private otpStorage = new Map<string, { otp: string, timestamp: number }>();
  private readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  /**
   * Send OTP to mobile number
   * In development: Shows OTP in alert
   * In production: Sends real SMS via MSG91
   */
  sendOtp(mobileNumber: string): Observable<boolean> {
    const cleanNumber = this.cleanMobileNumber(mobileNumber);
    
    if (!this.isValidIndianMobile(cleanNumber)) {
      console.error('Invalid mobile number format');
      return of(false);
    }

    // DEVELOPMENT MODE - Show OTP in alert
    if (SMS_CONFIG.isDevelopment) {
      return this.sendDevOtp(cleanNumber);
    }

    // PRODUCTION MODE - Send real SMS via MSG91
    return this.sendRealOtp(cleanNumber);
  }

  /**
   * Verify OTP entered by user
   */
  verifyOtp(mobileNumber: string, otp: string): Observable<boolean> {
    const cleanNumber = this.cleanMobileNumber(mobileNumber);

    // DEVELOPMENT MODE - Check against fixed OTP
    if (SMS_CONFIG.isDevelopment) {
      return this.verifyDevOtp(cleanNumber, otp);
    }

    // PRODUCTION MODE - Verify via MSG91
    return this.verifyRealOtp(cleanNumber, otp);
  }

  /**
   * Resend OTP
   */
  resendOtp(mobileNumber: string): Observable<boolean> {
    return this.sendOtp(mobileNumber);
  }

  // ==================== DEVELOPMENT MODE ====================

  private sendDevOtp(mobileNumber: string): Observable<boolean> {
    const otp = SMS_CONFIG.devOtp;
    
    // Store OTP with timestamp
    this.otpStorage.set(mobileNumber, {
      otp,
      timestamp: Date.now()
    });

    // Show OTP in alert for testing
    alert(`🔐 DEVELOPMENT MODE\n\nOTP for ${mobileNumber}:\n${otp}\n\n(This will be sent via SMS in production)`);
    console.log(`DEV OTP for ${mobileNumber}: ${otp}`);

    return of(true);
  }

  private verifyDevOtp(mobileNumber: string, otp: string): Observable<boolean> {
    const stored = this.otpStorage.get(mobileNumber);

    if (!stored) {
      console.error('No OTP found for this number');
      return of(false);
    }

    // Check if OTP expired
    if (Date.now() - stored.timestamp > this.OTP_EXPIRY_MS) {
      this.otpStorage.delete(mobileNumber);
      console.error('OTP expired');
      return of(false);
    }

    // Verify OTP
    const isValid = stored.otp === otp;
    
    if (isValid) {
      this.otpStorage.delete(mobileNumber);
      console.log('OTP verified successfully');
    } else {
      console.error('Invalid OTP');
    }

    return of(isValid);
  }

  // ==================== PRODUCTION MODE (MSG91) ====================

  private sendRealOtp(mobileNumber: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'authkey': SMS_CONFIG.msg91.authKey,
      'Content-Type': 'application/json'
    });

    const body = {
      template_id: SMS_CONFIG.msg91.templateId,
      mobile: `91${mobileNumber}`, // Add country code
      authkey: SMS_CONFIG.msg91.authKey
    };

    return this.http.post(SMS_CONFIG.msg91.apiUrl, body, { headers }).pipe(
      map((response: any) => {
        if (response.type === 'success') {
          console.log('OTP sent successfully via MSG91');
          return true;
        }
        console.error('MSG91 API error:', response);
        return false;
      }),
      catchError(error => {
        console.error('Failed to send OTP:', error);
        return of(false);
      })
    );
  }

  private verifyRealOtp(mobileNumber: string, otp: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'authkey': SMS_CONFIG.msg91.authKey,
      'Content-Type': 'application/json'
    });

    const body = {
      authkey: SMS_CONFIG.msg91.authKey,
      mobile: `91${mobileNumber}`,
      otp: otp
    };

    return this.http.post(`${SMS_CONFIG.msg91.apiUrl}/verify`, body, { headers }).pipe(
      map((response: any) => {
        if (response.type === 'success') {
          console.log('OTP verified successfully via MSG91');
          return true;
        }
        console.error('OTP verification failed:', response);
        return false;
      }),
      catchError(error => {
        console.error('Failed to verify OTP:', error);
        return of(false);
      })
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Clean mobile number - remove spaces, dashes, +91
   */
  private cleanMobileNumber(mobile: string): string {
    return mobile.replace(/\D/g, '').slice(-10);
  }

  /**
   * Validate Indian mobile number (10 digits, starts with 6-9)
   */
  private isValidIndianMobile(mobile: string): boolean {
    const pattern = /^[6-9]\d{9}$/;
    return pattern.test(mobile);
  }

  /**
   * Check if OTP is expired
   */
  private isOtpExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.OTP_EXPIRY_MS;
  }
}
