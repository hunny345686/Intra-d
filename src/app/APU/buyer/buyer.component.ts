import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-buyer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.css']
})
export class BuyerComponent implements OnInit {
  mainCategories: DropdownOption[] = [];
  subCategories: DropdownOption[] = [];
  productTypes: DropdownOption[] = [];
  detailsOptions: DropdownOption[] = [];
  currentUser: User | null = null;

  selectedMainCategory = '';
  selectedSubCategory = '';
  selectedProductType = '';
  selectedDetails = '';

  buyerData = { name: '', email: '', phone: '', quantity: '' };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.mainCategories = [
      { label: 'Fruits & Vegetables', value: 'fruits-vegetables' }
    ];
  }

  onMainCategoryChange(): void {
    this.subCategories = [
      { label: 'Fruits', value: 'fruits' },
      { label: 'Vegetables', value: 'vegetables' }
    ];
  }

  onSubCategoryChange(): void {
    this.productTypes = [
      { label: 'Mango', value: 'mango' },
      { label: 'Tomato', value: 'tomato' }
    ];
  }

  onProductTypeChange(): void {
    this.detailsOptions = [
      { label: 'Slices', value: 'slices' },
      { label: 'Powder', value: 'powder' }
    ];
  }

  getLabel(options: DropdownOption[], value: string): string {
    const found = options.find(option => option.value === value);
    return found ? found.label : value;
  }

  onSubmit(): void {
    console.log('Buyer inquiry submitted');
    alert('Inquiry submitted successfully!');
  }
}
