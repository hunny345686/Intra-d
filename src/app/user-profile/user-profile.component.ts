import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { APP_CONSTANTS } from '../constants';

interface ProfileData {
  name: string;
  location: string;
  phone: string;
  language: string;
  profileImage: string;
  roleSpecific: any;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileData: ProfileData | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadProfileData(user);
      }
    });
  }

  private loadProfileData(user: User) {
    // Use Firebase data if available, otherwise use mock data
    const baseProfile = {
      name: user.name || this.getUserName(user.role),
      location: user.profileData?.village || 'Warangal, Telangana',
      phone: user.profileData?.mobileNo || '9876543210',
      language: 'తెలుగు',
      profileImage: user.profileData?.profileImage || 'assets/images/default-avatar.svg'
    };

    switch (user.role) {
      case APP_CONSTANTS.ROLES.FARMER:
        this.profileData = {
          ...baseProfile,
          roleSpecific: {
            land: user.profileData?.acreOfLand + ' Acres' || '3 Acres',
            crops: user.profileData?.typicalCrops || 'Rice, Maize',
            soilType: user.profileData?.soilType || 'Black Soil'
          }
        };
        break;
      case APP_CONSTANTS.ROLES.USER:
        this.profileData = {
          ...baseProfile,
          roleSpecific: {
            orders: user.profileData?.orders || 15,
            totalSpent: user.profileData?.totalSpent || '₹25,000',
            preferredCrops: user.profileData?.preferredCrops || 'Vegetables, Fruits'
          }
        };
        break;
      case APP_CONSTANTS.ROLES.ADMIN:
        this.profileData = {
          ...baseProfile,
          roleSpecific: {
            totalUsers: user.profileData?.totalUsers || 1250,
            totalFarmers: user.profileData?.totalFarmers || 850,
            totalOrders: user.profileData?.totalOrders || 3500
          }
        };
        break;
      default:
        this.profileData = baseProfile as ProfileData;
    }
  }

  private getUserName(role: string): string {
    switch (role) {
      case APP_CONSTANTS.ROLES.FARMER:
        return 'Farmer';
      case APP_CONSTANTS.ROLES.USER:
        return 'Buyer User';
      case APP_CONSTANTS.ROLES.ADMIN:
        return 'Admin User';
      default:
        return 'User';
    }
  }

  navigateBack() {
    this.router.navigate([this.getDashboardRoute()]);
  }

  navigateToMyCrops() {
    alert('Feature coming soon...');
    console.log('Navigate to My Crops');
  }

  navigateToSoilTest() {
    alert('Feature coming soon...');
    console.log('Navigate to Soil Test');
  }

  navigateToMarketPrices() {
    // console.log('Navigate to Market Prices');
    alert('Feature coming soon...');
  }

  navigateToHelpCenter() {
    alert('Feature coming soon...');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/homepage']);
  }

  private getDashboardRoute(): string {
    if (!this.currentUser) return '/';
    
    switch (this.currentUser.role) {
      case APP_CONSTANTS.ROLES.FARMER:
        return '/seller';
      case APP_CONSTANTS.ROLES.USER:
        return '/buyer';
      case APP_CONSTANTS.ROLES.ADMIN:
        return '/admin';
      default:
        return '/';
    }
  }
}