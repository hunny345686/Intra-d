import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeoLocationService } from '../../services/geo-location.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-book-soil',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './book-soil.component.html',
  styleUrl: './book-soil.component.css',
})
export class BookSoilComponent {

  
  
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

  constructor(private geoService: GeoLocationService, private http: HttpClient) {}

  /**
   * Handle form submission
   */
async onSubmit() {
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
