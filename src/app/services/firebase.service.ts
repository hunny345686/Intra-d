import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../../environments/firebase.config';

export interface SignupUser {
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
  role?: string;
  email?: string;
  password?: string;
  userId?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private baseUrl = 'https://intra-d-default-rtdb.asia-southeast1.firebasedatabase.app';
  private db: any;
  private auth: any;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only initialize Firebase in browser context
    if (isPlatformBrowser(this.platformId)) {
      const app = initializeApp(firebaseConfig);
      this.db = getDatabase(app);
      this.auth = getAuth(app);
    }
  }

  // Create user with credentials using HTTP
  createUser(userData: SignupUser): Observable<any> {
    const userId = this.generateUserId();
    const generatedPassword = this.generatePassword();
    const userWithCredentials = {
      ...userData,
      userId,
      email: `${userData.name.toLowerCase().replace(/\s+/g, '')}@intra-d.com`,
      password: generatedPassword,
      role: userData.role || 'farmer', // Default to farmer if no role specified
      createdAt: new Date().toISOString()
    };
    
    return this.http.post(`${this.baseUrl}/signUpFrom/${userId}.json`, userWithCredentials)
      .pipe(
        map(response => ({ ...response, generatedPassword }))
      );
  }

  // Read user by ID
  getUser(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/signUpFrom/${userId}.json`);
  }

  // Update user
  updateUser(userId: string, userData: Partial<SignupUser>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/signUpFrom/${userId}.json`, userData);
  }

  // Delete user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/signUpFrom/${userId}.json`);
  }

  // Get all users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/signUpFrom.json`);
  }

  // Update user password
  updateUserPassword(email: string, newPassword: string): Observable<any> {
    return this.getAllUsers().pipe(
      switchMap((users: any) => {
        if (!users) return from([null]);
        
        // Find user by email
        for (const userId in users) {
          const userContainer = users[userId];
          for (const firebaseKey in userContainer) {
            const user = userContainer[firebaseKey];
            if (user && user.email === email) {
              // Update password using HTTP PATCH
              return this.http.patch(`${this.baseUrl}/signUpFrom/${userId}/${firebaseKey}.json`, {
                password: newPassword
              });
            }
          }
        }
        return from([null]);
      })
    );
  }

  // Firebase Auth signup
  signupWithEmailPassword(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  // Firebase Auth login
  loginWithEmailPassword(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  // Login authentication (legacy)
  authenticateUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/signInForm.json`, {
      email,
      password,
      loginTime: new Date().toISOString()
    });
  }

  // Verify user credentials
  verifyCredentials(email: string, password: string): Observable<any> {
    return this.getAllUsers();
  }

  // Create land lease application
  createLeaseApplication(leaseData: any): Observable<any> {
    const applicationId = this.generateApplicationId();
    const applicationWithId = {
      ...leaseData,
      applicationId,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    return this.http.post(`${this.baseUrl}/landLeaseApplication/${applicationId}.json`, applicationWithId);
  }

  // Get lease application by ID
  getLeaseApplication(applicationId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/landLeaseApplication/${applicationId}.json`);
  }

  // Update lease application
  updateLeaseApplication(applicationId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/landLeaseApplication/${applicationId}.json`, data);
  }

  // Delete lease application
  deleteLeaseApplication(applicationId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/landLeaseApplication/${applicationId}.json`);
  }

  // Get all lease applications
  getAllLeaseApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/landLeaseApplication.json`);
  }

  // Service Requests Management
  createServiceRequest(serviceData: any): Observable<any> {
    const requestId = this.generateRequestId();
    const requestWithId = {
      ...serviceData,
      requestId,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    return this.http.post(`${this.baseUrl}/serviceRequests/${requestId}.json`, requestWithId);
  }

  getAllServiceRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/serviceRequests.json`);
  }

  updateServiceRequest(requestId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/serviceRequests/${requestId}.json`, data);
  }

  deleteServiceRequest(requestId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/serviceRequests/${requestId}.json`);
  }

  // Soil Test Requests
  getAllSoilTestRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/soilTest.json`);
  }

  updateSoilTestRequest(requestId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/soilTest/${requestId}.json`, data);
  }

  // Buyer/Seller Forms
  getAllBuyerForms(): Observable<any> {
    return this.http.get(`${this.baseUrl}/buyerForms.json`);
  }

  getAllSellerForms(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sellerForms.json`);
  }

  private generateRequestId(): string {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateApplicationId(): string {
    return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}