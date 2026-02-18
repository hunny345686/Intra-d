import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GeoLocationService } from '../../services/geo-location.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslatePipe } from '../../shared/translate.pipe';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-book-soil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, TranslatePipe],
  templateUrl: './book-soil.component.html',
  styleUrl: './book-soil.component.css',
})
export class BookSoilComponent implements OnInit {

  
  
  @ViewChild('soilForm') soilForm!: NgForm;

  title = 'Soil Test Booking';

  // Soil Test Form Model
  soilTestForm = {
    farmerName: '',
    mobileNumber: '',
    village: '',

    landArea: null as number | null,
    irrigationType: '',

    currentCrop: '',
    previousCrop: '',

    sampleDate: '',
    sampleDepth: '0_15',
    fieldCondition: 'dry',

    problemDescription: ''
  };

  constructor(
    private geoService: GeoLocationService, 
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Pre-populate form with user data if logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.soilTestForm.farmerName = user.name || '';
        this.soilTestForm.mobileNumber = user.phone || user.profileData?.mobileNo || user.profileData?.phone || '';
        this.soilTestForm.village = user.profileData?.village || user.location || '';
      }
    });
  }

  goBack(): void {
    // Check if user is a farmer and navigate to farmer dashboard
    this.authService.currentUser$.subscribe(user => {
      if (user?.role === 'farmer') {
        this.router.navigate(['/farmer']);
      } else {
        // Otherwise go back in history
        window.history.back();
      }
    }).unsubscribe();
  }

  goToFarmerDashboard(): void {
    this.router.navigate(['/farmer']);
  }

  /**
   * Handle form submission
   */
  onPhoneInput(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  }

async onSubmit() {
  if (this.soilForm.invalid) {
    this.soilForm.form.markAllAsTouched();
    return;
  }
  try {
    const location = await this.geoService.getCurrentLocation();

    const payload = {
      ...this.soilTestForm,
      location,
      createdAt: new Date().toISOString(),
      status: 'REQUESTED'
    };

    this.http.post('https://intra-d-default-rtdb.asia-southeast1.firebasedatabase.app/soilTest.json', payload).subscribe({
      next: (response) => {
        console.log('Success:', response);
        alert('Soil Test Request Submitted with Location');
        this.resetForm();
      },
      error: (error) => {
        console.error('HTTP Error:', error);
        alert('Unable to submit request. Please try again.');
      }
    });

  } catch (error) {
    console.error('Location Error:', error);
    alert('Unable to get location. Please enable GPS.');
  }
}


  /**
   * Reset form after submit
   */
  resetForm(): void {
    this.soilTestForm = {
      farmerName: '',
      mobileNumber: '',
      village: '',

      landArea: null,
      irrigationType: '',

      currentCrop: '',
      previousCrop: '',

      sampleDate: '',
      sampleDepth: '0_15',
      fieldCondition: 'dry',

      problemDescription: ''
    };
  }
}
