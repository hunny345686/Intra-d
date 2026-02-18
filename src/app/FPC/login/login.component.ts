import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  loginMessage: string = '';
  loginMessageType: 'success' | 'danger' | '' = '';
  isLoading: boolean = false;

  @Output() loginSuccess = new EventEmitter<void>();
  @ViewChild('loginForm') loginHtmlForm!: NgForm;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  private redirectByRole(): void {
    const dashboardRoute = this.authService.getDashboardRoute();
    this.router.navigate([dashboardRoute]);
  }

  handleLogin(): void {
    if (!this.loginHtmlForm.valid) {
      this.loginHtmlForm.form.markAllAsTouched();
      return;
    }
    
    this.performLogin();
  }

  performLogin(): void {
    if (!this.loginHtmlForm.valid) {
      this.loginHtmlForm.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    this.loginMessage = '';
    console.log('Starting login process...');
    
    // First verify credentials exist in signUpFrom
    this.firebaseService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Retrieved users:', users);
        const userFound = this.findUserByCredentials(users, this.loginData.email, this.loginData.password);
        console.log('User found:', userFound);
        
        if (userFound) {
          console.log('Logging signin to Firebase...');
          // Log signin to signInForm API
          this.firebaseService.authenticateUser(this.loginData.email, this.loginData.password)
            .subscribe({
              next: (response) => {
                console.log('Signin logged successfully:', response);
                // Get Firebase user with role
                const firebaseUser = this.authService.validateFirebaseUser(this.loginData.email, this.loginData.password, users);
                if (firebaseUser) {
                  // Manually set the user in auth service
                  this.authService.setCurrentUser(firebaseUser);
                  this.isLoading = false;
                  this.loginMessage = 'Login successful!';
                  this.loginMessageType = 'success';
                  this.loginHtmlForm.resetForm();
                  this.loginSuccess.emit();
                  this.redirectByRole();
                }
              },
              error: (error) => {
                console.error('Signin logging failed:', error);
                this.isLoading = false;
                this.loginMessage = 'Login logging failed. Please try again.';
                this.loginMessageType = 'danger';
              }
            });
        } else {
          this.isLoading = false;
          this.loginMessage = 'Invalid email or password.';
          this.loginMessageType = 'danger';
        }
      },
      error: (error) => {
        console.error('Failed to retrieve users:', error);
        this.isLoading = false;
        this.loginMessage = 'Login failed. Please try again.';
        this.loginMessageType = 'danger';
      }
    });
  }

  private findUserByCredentials(users: any, email: string, password: string): boolean {
    if (!users) return false;
    
    for (const userId in users) {
      const userContainer = users[userId];
      // Navigate through the nested structure
      for (const firebaseKey in userContainer) {
        const user = userContainer[firebaseKey];
        if (user && user.email === email && user.password === password) {
          return true;
        }
      }
    }
    return false;
  }
}
