import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { APP_CONSTANTS } from '../constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class UserProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentUser: User | null = null;
  profileData: ProfileData | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadProfileData(user);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfileData(user: User) {
    // Use Firebase data if available, otherwise use mock data
    // Check multiple possible phone field names
    const phoneNumber = user.phone || user.profileData?.mobileNo || user.profileData?.phone || '9876543210';
    console.log('Phone number:', phoneNumber);
    const baseProfile = {
      name: user.name || this.getUserName(user.role),
      location: user.location || user.profileData?.village || user.profileData?.location || 'Warangal, Telangana',
      phone: phoneNumber,
      language: 'తెలుగు',
      profileImage: user.profileData?.profileImage || 'assets/images/default-avatar.svg'
    };

    switch (user.role) {
      case APP_CONSTANTS.ROLES.FARMER:
        this.profileData = {
          ...baseProfile,
          roleSpecific: {
            // Pre-populate all signup data fields
            land: (user.profileData?.acreOfLand ? user.profileData.acreOfLand + ' Acres' : '3 Acres'),
            crops: user.profileData?.typicalCrops || 'Rice, Maize',
            soilType: user.profileData?.soilType || 'Black Soil',
            village: user.profileData?.village || user.location || 'Warangal',
            mandal: user.profileData?.mandal || 'N/A',
            waterSource: user.profileData?.waterSource || 'Borewell',
            fertilizers: user.profileData?.fertilizers || 'N/A',
            soilTest: user.profileData?.soilTest || 'not-tested',
            email: user.email || 'N/A',
            userId: user.profileData?.userId || user.id || 'N/A',
            createdAt: user.profileData?.createdAt || 'N/A'
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
    this.authService.logout('/homepage');
  }

  private getDashboardRoute(): string {
    if (!this.currentUser) return '/homepage';
    
    switch (this.currentUser.role) {
      case APP_CONSTANTS.ROLES.FARMER:
        return '/farmer';
      case APP_CONSTANTS.ROLES.USER:
        return '/buyer';
      case APP_CONSTANTS.ROLES.ADMIN:
        return '/control';
      default:
        return '/homepage';
    }
  }
}