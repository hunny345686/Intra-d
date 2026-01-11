import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent {
  formData = {
    sellerName: '',
    contactNo: '',
    email: '',
    rawMaterialType: '',
    quantity: '',
    location: '',
    pricePerUnit: null as number | null,
    harvestDate: '',
    qualityGrade: ''
  };

  onSubmit(): void {
    console.log('Seller offer submitted');
    alert('Seller offer submitted successfully!');
  }
}
