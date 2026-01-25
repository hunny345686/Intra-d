import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, timeout, retry } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ServiceInfoComponent } from '../service-info/service-info.component';
import { LoginComponent } from '../login/login.component';
import { AuthService, User } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { TranslatePipe } from '../../shared/translate.pipe';

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
  imports: [CommonModule, FormsModule, RouterModule, ServiceInfoComponent, LoginComponent, TranslatePipe],
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
    private readonly firebaseService: FirebaseService
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
    this.authService.logout();
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
      console.warn('Invalid forgot password form submission');
      return;
    }
    console.log('Forgot password form submitted');
    alert('Password reset request submitted!');
    this.hideModal('forgotPassModal');
    this.forgotHtmlForm.resetForm();
  }
}
