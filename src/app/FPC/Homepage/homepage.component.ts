import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, timeout, retry, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ServiceInfoComponent } from '../service-info/service-info.component';
import { LoginComponent } from '../login/login.component';
import { AuthService, User } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { OtpService } from '../../services/otp.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { OtpVerificationComponent } from '../../shared/otp-verification/otp-verification.component';

declare var bootstrap: any;

interface SignupFormData {
  name: string;
  typicalCrops: string;
  village: string;
  waterSource: string;
  mandal: string;
  soilTest: string;
  mobileNo: string;
  soilType: string;
  acreOfLand: number | null;
  fertilizers: string;
  role: string;
}

interface WeatherData {
  location: string;
  temperature: number | string;
  description: string;
  humidity: number | string;
  windSpeed: number | string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ServiceInfoComponent, LoginComponent, TranslatePipe, OtpVerificationComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly API_TIMEOUT = 10000;
  private readonly MAX_RETRIES = 2;
  
  isLoggedIn = false;
  currentUser: User | null = null;
  selectedFeature = '';
  weatherData: WeatherData | null = null;
  
  readonly farmersData = {
    totalFarmers: 0,
    activeFarmers: 0,
    newThisMonth: 0
  };

  signupData: SignupFormData = {
    name: '', typicalCrops: '', village: '', waterSource: '',
    mandal: '', soilTest: '', mobileNo: '', soilType: '',
    acreOfLand: null, fertilizers: '', role: ''
  };

  showOtpModal: boolean = false;
  isMobileVerified: boolean = false;
  showOtpField: boolean = false;
  otpCode: string = '';
  otpSent: boolean = false;
  isVerifyingOtp: boolean = false;
  isSendingOtp: boolean = false;
  otpMessage: string = '';
  otpMessageType: 'success' | 'danger' = 'danger';

  forgotPasswordData = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  @ViewChild('signupForm') signupHtmlForm!: NgForm;
  @ViewChild('forgotForm') forgotHtmlForm!: NgForm;

  private readonly apiKey = '93e63dcc1fb38ed986a59514d85dbbd1';
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly firebaseService: FirebaseService,
    private readonly otpService: OtpService
  ) {
    console.log('HomepageComponent initialized');
  }

  onPhoneInput(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isLoggedIn = !!user;
          console.log('User state updated:', { isLoggedIn: this.isLoggedIn });
        },
        error: (error) => {
          console.error('Error in user subscription:', error);
        }
      });
    
    this.loadFarmersData();
  }

  private loadFarmersData(): void {
    this.firebaseService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          if (users) {
            let farmerCount = 0;
            for (const userId in users) {
              const userContainer = users[userId];
              for (const firebaseKey in userContainer) {
                const user = userContainer[firebaseKey];
                if (user?.role === 'farmer') {
                  farmerCount++;
                }
              }
            }
            (this.farmersData as any).totalFarmers = farmerCount;
            (this.farmersData as any).activeFarmers = farmerCount;
            (this.farmersData as any).newThisMonth = 0;
          }
        },
        error: (error) => {
          console.error('Error loading farmers data:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('HomepageComponent destroyed');
  }

  onLoginSuccess(): void {
    console.log('Login successful');
  }

  handleLogout(): void {
    this.authService.logout('/homepage');
    console.log('User logged out');
  }

  setComingSoonFeature(feature: string): void {
    this.selectedFeature = feature.replace(/[<>]/g, '').trim();
    console.log('Feature selected:', this.selectedFeature);
  }

  private getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        console.error('Geolocation not supported by browser');
        reject(new Error('Geolocation not supported'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Geolocation timeout'));
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('Location obtained:', coords);
          resolve(coords);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Geolocation error:', error);
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  async showWeather(): Promise<void> {
    try {
      console.log('Fetching weather data');
      const { lat, lon } = await this.getCurrentLocation();
      
      if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        throw new Error('Invalid coordinates');
      }

      const requestUrl = `${this.apiUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;

      this.http.get(requestUrl)
        .pipe(
          timeout(this.API_TIMEOUT),
          retry(this.MAX_RETRIES),
          catchError((error: HttpErrorResponse) => {
            console.error('Weather API error:', error);
            return of(null);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (data: any) => {
            if (data) {
              this.weatherData = {
                location: (data.name || 'Unknown').replace(/[<>]/g, ''),
                temperature: Math.round(data.main?.temp || 0),
                description: (data.weather?.[0]?.description || 'No data').replace(/[<>]/g, ''),
                humidity: data.main?.humidity || 'N/A',
                windSpeed: data.wind?.speed || 'N/A'
              };
              this.selectedFeature = 'Weather';
              this.showModal('weatherModal');
              console.log('Weather data loaded successfully');
            } else {
              this.showErrorModal('Weather service unavailable');
            }
          },
          error: (error) => {
            console.error('Weather subscription error:', error);
            this.showErrorModal('Error fetching weather data');
          }
        });
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.showErrorModal('Could not get location. Please enable location services.');
    }
  }

  private showErrorModal(message: string): void {
    const sanitizedMessage = message.replace(/[<>]/g, '').trim();
    this.weatherData = {
      location: 'Error',
      temperature: 'N/A',
      description: sanitizedMessage,
      humidity: 'N/A',
      windSpeed: 'N/A'
    };
    this.selectedFeature = 'Weather';
    this.showModal('weatherModal');
    console.warn('Error modal shown:', sanitizedMessage);
  }

  private showModal(modalId: string): void {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.show();
        console.log('Modal shown:', modalId);
      }
    } catch (error) {
      console.error('Modal show error:', error);
    }
  }

  showFarmers(): void {
    this.showModal('farmersModal');
    console.log('Farmers modal displayed');
  }

  handleSignup(): void {
    if (this.signupHtmlForm.invalid) {
      this.signupHtmlForm.form.markAllAsTouched();
      console.warn('Invalid signup form submission');
      return;
    }

    // Check if mobile verification is required
    if (!this.isMobileVerified) {
      if (!this.otpSent) {
        // Send OTP first
        this.sendOtpForVerification();
      } else {
        // OTP sent but not verified
        this.otpMessage = 'Please verify the OTP sent to your mobile number';
        this.otpMessageType = 'danger';
      }
      return;
    }

    this.performSignup();
  }

  sendOtpForVerification(): void {
    if (!this.signupData.mobileNo) {
      this.otpMessage = 'Please enter mobile number first.';
      this.otpMessageType = 'danger';
      return;
    }
    
    this.isSendingOtp = true;
    this.otpMessage = '';
    
    console.log('Sending OTP to:', this.signupData.mobileNo);
    this.otpService.sendOtp(this.signupData.mobileNo).subscribe({
      next: () => {
        console.log('OTP sent successfully');
        this.showOtpField = true;
        this.otpSent = true;
        this.isSendingOtp = false;
        this.otpMessage = `OTP sent to ${this.signupData.mobileNo}`;
        this.otpMessageType = 'success';
      },
      error: (error) => {
        console.error('Failed to send OTP:', error);
        this.isSendingOtp = false;
        this.otpMessage = 'Failed to send OTP. Please try again.';
        this.otpMessageType = 'danger';
      }
    });
  }

  verifyOtpInline(): void {
    if (this.otpCode.length !== 6) {
      this.otpMessage = 'Please enter a valid 6-digit OTP';
      this.otpMessageType = 'danger';
      return;
    }
    
    this.isVerifyingOtp = true;
    this.otpMessage = '';
    
    this.otpService.verifyOtp(this.signupData.mobileNo, this.otpCode).subscribe({
      next: (isValid) => {
        this.isVerifyingOtp = false;
        if (isValid) {
          this.isMobileVerified = true;
          this.otpMessage = 'Mobile number verified successfully!';
          this.otpMessageType = 'success';
        } else {
          this.otpMessage = 'Invalid OTP. Please try again.';
          this.otpMessageType = 'danger';
        }
      },
      error: (error) => {
        console.error('OTP verification error:', error);
        this.isVerifyingOtp = false;
        this.otpMessage = 'Verification failed. Please try again.';
        this.otpMessageType = 'danger';
      }
    });
  }

  resendOtpInline(): void {
    this.otpCode = '';
    this.otpMessage = '';
    this.sendOtpForVerification();
  }

  onOtpVerified(verified: boolean): void {
    if (verified) {
      this.isMobileVerified = true;
      this.showOtpModal = false;
      this.performSignup();
    }
  }

  onOtpModalClosed(): void {
    this.showOtpModal = false;
  }

  performSignup(): void {
    if (this.signupHtmlForm.invalid) {
      this.signupHtmlForm.form.markAllAsTouched();
      console.warn('Invalid signup form submission');
      return;
    }

    const sanitizedData = {
      ...this.signupData,
      name: this.signupData.name.replace(/[<>]/g, '').trim(),
      village: this.signupData.village.replace(/[<>]/g, '').trim(),
      mandal: this.signupData.mandal.replace(/[<>]/g, '').trim(),
      mobileNo: this.signupData.mobileNo.replace(/[<>]/g, '').trim()
    };

    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    if (!phoneRegex.test(sanitizedData.mobileNo)) {
      console.warn('Invalid phone number in signup');
      alert('Please enter a valid phone number');
      return;
    }

    console.log('Processing user signup');
    
    this.firebaseService.createUser(sanitizedData)
      .pipe(
        timeout(this.API_TIMEOUT),
        catchError((error) => {
          console.error('Signup error:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('User created successfully');
            this.hideModal('signupModal');
            this.showSuccessModal(sanitizedData.name, response.generatedPassword);
            this.signupHtmlForm.resetForm();
          } else {
            alert('Registration failed. Please try again.');
          }
        },
        error: (error) => {
          console.error('Signup subscription error:', error);
          alert('Registration failed. Please try again.');
        }
      });
  }

  private hideModal(modalId: string): void {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        console.log('Modal hidden:', modalId);
      }
    } catch (error) {
      console.error('Modal hide error:', error);
    }
  }

  private showSuccessModal(name: string, password: string): void {
    try {
      const successModalElement = document.getElementById('successModal');
      if (successModalElement) {
        const sanitizedName = name.replace(/[<>]/g, '').trim();
        const email = `${sanitizedName.toLowerCase().replace(/\s+/g, '')}@intra-d.com`;
        
        const labelElement = document.getElementById('successModalLabel');
        const bodyElement = document.querySelector('#successModal .modal-body') as HTMLElement;
        
        if (labelElement) labelElement.textContent = 'Registration Successful';
        if (bodyElement) {
          bodyElement.innerHTML = `
            <p>Your account has been created successfully!</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please save these credentials for future login.</p>
          `;
        }
        
        const modal = bootstrap.Modal.getInstance(successModalElement) || new bootstrap.Modal(successModalElement);
        modal.show();
        console.log('Success modal shown for user registration');
      }
    } catch (error) {
      console.error('Success modal error:', error);
    }
  }

  handleForgotPassword(): void {
    if (this.forgotHtmlForm.invalid) {
      this.forgotHtmlForm.form.markAllAsTouched();
      console.warn('Invalid forgot password form submission');
      return;
    }

    if (this.forgotPasswordData.password !== this.forgotPasswordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Processing password reset for:', this.forgotPasswordData.email);
    
    this.firebaseService.updateUserPassword(this.forgotPasswordData.email, this.forgotPasswordData.password)
      .pipe(
        timeout(this.API_TIMEOUT),
        catchError((error: any) => {
          console.error('Password reset error:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            console.log('Password updated successfully');
            alert('Password updated successfully! You can now login with your new password.');
            this.hideModal('forgotPassModal');
            this.forgotHtmlForm.resetForm();
          } else {
            alert('User not found or password update failed.');
          }
        },
        error: (error: any) => {
          console.error('Password reset subscription error:', error);
          alert('Password reset failed. Please try again.');
        }
      });
  }
}