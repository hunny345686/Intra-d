import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent {
  @ViewChild('sellerForm') sellerForm!: NgForm;

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

  onPhoneInput(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  }

  onSubmit(): void {
    if (this.sellerForm.invalid) {
      this.sellerForm.form.markAllAsTouched();
      return;
    }
    console.log('Seller offer submitted');
    alert('Seller offer submitted successfully!');
  }
}
