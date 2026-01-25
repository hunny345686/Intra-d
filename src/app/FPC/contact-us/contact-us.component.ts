import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  @ViewChild('contactForm') contactForm!: NgForm;

  // Model for the form data
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    phone: '',
  };

  constructor() {}

  ngOnInit(): void {
    // Initialization logic can go here if needed
  }

  /**
   * Handles the form submission.
   * Logs the form data to the console and shows an alert.
   * In a real application, this data would be sent to a backend service.
   */
  onPhoneInput(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.form.markAllAsTouched();
      return;
    }
    console.log('Contact Form Submitted!', this.formData);
    // In a production application, you would typically send this.formData to an API
    alert('Your message has been sent! We will get in touch soon.');
    this.resetForm(); // Reset the form fields after submission
  }

  /**
   * Resets the form data to its initial empty state.
   */
  resetForm(): void {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
      phone: '',
    };
  }
}
