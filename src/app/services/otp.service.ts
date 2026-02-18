import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private otpStorage = new Map<string, string>();

  constructor(private http: HttpClient) {}

  sendOtp(mobileNumber: string): Observable<boolean> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in production, this would be server-side)
    this.otpStorage.set(mobileNumber, otp);
    
    // Simulate API call to SMS service
    console.log(`OTP for ${mobileNumber}: ${otp}`); // Remove in production
    
    // In production, replace with actual SMS API call:
    // return this.http.post<boolean>('/api/send-otp', { mobileNumber, otp });
    
    return of(true).pipe(delay(1000));
  }

  verifyOtp(mobileNumber: string, otp: string): Observable<boolean> {
    const storedOtp = this.otpStorage.get(mobileNumber);
    const isValid = storedOtp === otp;
    
    if (isValid) {
      this.otpStorage.delete(mobileNumber);
    }
    
    // In production, replace with actual API call:
    // return this.http.post<boolean>('/api/verify-otp', { mobileNumber, otp });
    
    return of(isValid).pipe(delay(500));
  }
}