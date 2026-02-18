import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { ServiceInfoComponent } from "../service-info/service-info.component";
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ServiceInfoComponent, TranslatePipe],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  isLoggedIn = false;
  currentUser: User | null = null;
  selectedFeature = '';
  weatherData: any = null;
  
  farmersData = {
    totalFarmers: 1250,
    activeFarmers: 980,
    newThisMonth: 45
  };

  signupData = {
    name: '', typicalCrops: '', village: '', waterSource: '',
    mandal: '', soilTest: '', mobileNo: '', soilType: '',
    acreOfLand: null, fertilizers: '', role: ''
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private firebaseService: FirebaseService
  ) {}

  onLoginSuccess(): void {
    console.log('Login successful');
  }

  handleLogout(): void {
    this.authService.logout('/homepage');
  }

  setComingSoonFeature(feature: string): void {
    this.selectedFeature = feature;
  }

  showWeather(): void {
    console.log('Weather feature clicked');
  }

  showFarmers(): void {
    console.log('Farmers feature clicked');
  }

  handleSignup(): void {
    console.log('Signup submitted');
  }
}