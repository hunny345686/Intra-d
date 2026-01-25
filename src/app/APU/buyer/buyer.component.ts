import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { TranslatePipe } from '../../shared/translate.pipe';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-buyer',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.css']
})
export class BuyerComponent implements OnInit {
  @ViewChild('buyerForm') buyerForm!: NgForm;

  // Data structure for all dropdowns
  productHierarchy = {
    'fruits-vegetables': {
      label: 'Fruits & Vegetables',
      subCategories: {
        fruits: {
          label: 'Fruits',
          productTypes: {
            mango: {
              label: 'Mango',
              details: {
                slices: 'Slices',
                granules: 'Granules',
                powder: 'Powder',
              },
            },
            tomato: {
              label: 'Tomato',
              details: {
                diced: 'Diced',
                juice: 'Juice Concentrate',
              },
            },
            banana: {
              label: 'Banana',
              details: {
                chips: 'Chips',
                powder: 'Powder',
              },
            },
          },
        },
        vegetables: {
          label: 'Vegetables',
          productTypes: {
            onion: {
              label: 'Onion',
              details: {
                flakes: 'Flakes',
                powder: 'Powder',
              },
            },
            garlic: {
              label: 'Garlic',
              details: {
                flakes: 'Flakes',
                powder: 'Powder',
              },
            },
            ginger: {
              label: 'Ginger',
              details: {
                powder: 'Powder',
                slices: 'Slices',
              },
            },
            tomato: {
              label: 'Tomato',
              details: {
                powder: 'Powder',
                paste: 'Paste',
              },
            },
          },
        },
      },
    },
    // cereals: {
    //   label: 'Cereals',
    //   subCategories: {
    //     wheat: {
    //       label: 'Wheat',
    //       // productTypes: {
    //       //   flour: 'Flour',
    //       //   grains: 'Grains',
    //       // },
    //     },
    //   },
    // },
    // pulses: {
    //   label: 'Pulses',
    //   subCategories: {
    //     lentils: {
    //       label: 'Lentils',
    //       // productTypes: {
    //       //   whole: 'Whole',
    //       //   split: 'Split',
    //       // },
    //     },
    //   },
    // },
    RawVegetablesFurits: {
      label: 'Raw Vegetables & Furits',
      subCategories: {
        lentils: {
          label: 'Lentils',
          productTypes: {
            // whole: 'Whole',
            // split: 'Split',
          },
        },
      },
    },
  };

  // Dropdown options for the template
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

  onPhoneInput(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  }

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
    if (this.buyerForm.invalid) {
      this.buyerForm.form.markAllAsTouched();
      return;
    }
    const submissionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mainCategory: this.selectedMainCategory,
      subCategory: this.selectedSubCategory,
      productType: this.selectedProductType,
      details: this.selectedDetails,
      buyer: this.buyerData,
      status: 'pending',
    };

    console.log('Buyer Inquiry Submitted:', submissionData);
    // In a real application, send submissionData to your backend API
    alert('Your buyer inquiry has been submitted! Check console for details.');
    this.resetForm();
  }

  /**
   * Resets all form selections.
   */
  resetForm(): void {
    this.selectedMainCategory = '';
    this.selectedSubCategory = '';
    this.selectedProductType = '';
    this.selectedDetails = '';
    this.buyerData = { name: '', email: '', phone: '', quantity: '' };
    this.subCategories = [];
    this.productTypes = [];
    this.detailsOptions = [];
  }
}
