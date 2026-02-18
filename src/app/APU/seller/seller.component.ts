import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent implements OnInit {
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
  
  // View management
  currentView: 'form' | 'confirmation' = 'form';
  submittedData: any = null;
  showLastSubmission: boolean = false;

  ngOnInit(): void {
    // Load last submission from localStorage
    this.loadLastSubmission();
  }
  
  /**
   * Load last submission from localStorage
   */
  loadLastSubmission(): void {
    const lastSubmission = localStorage.getItem('lastSellerSubmission');
    if (lastSubmission) {
      try {
        this.submittedData = JSON.parse(lastSubmission);
        this.showLastSubmission = true;
      } catch (error) {
        console.error('Error loading last submission:', error);
      }
    }
  }
  
  /**
   * Toggle last submission visibility
   */
  toggleLastSubmission(): void {
    this.showLastSubmission = !this.showLastSubmission;
  }

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
    
    const submissionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...this.formData,
      status: 'pending'
    };
    
    console.log('Seller offer submitted:', submissionData);
    
    // Save to localStorage for future reference
    localStorage.setItem('lastSellerSubmission', JSON.stringify(submissionData));
    
    // Store submitted data and show confirmation
    this.submittedData = submissionData;
    this.currentView = 'confirmation';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Go back to form view
   */
  backToForm(): void {
    this.currentView = 'form';
    this.resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Submit another offer
   */
  submitAnother(): void {
    this.currentView = 'form';
    this.resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Reset form data
   */
  resetForm(): void {
    this.formData = {
      sellerName: '',
      contactNo: '',
      email: '',
      rawMaterialType: '',
      quantity: '',
      location: '',
      pricePerUnit: null,
      harvestDate: '',
      qualityGrade: ''
    };
    this.submittedData = null;
  }
}
