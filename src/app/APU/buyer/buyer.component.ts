import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

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
export class BuyerComponent implements OnInit, OnDestroy {
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
  
  // View management
  currentView: 'form' | 'confirmation' = 'form';
  submittedData: any = null;
  showLastSubmission: boolean = false;

  private userSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  goToProfile(): void { this.router.navigate(['/profile']); }
  logout(): void { this.authService.logout('/homepage'); }
  backToAPU(): void { this.router.navigate(['/apu']); }

  onPhoneInput(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  }

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.mainCategories = [
      { label: 'Fruits & Vegetables', value: 'fruits-vegetables' }
    ];
    
    // Load last submission from localStorage
    this.loadLastSubmission();
  }
  
  /**
   * Load last submission from localStorage
   */
  loadLastSubmission(): void {
    const lastSubmission = localStorage.getItem('lastBuyerSubmission');
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

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
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
      mainCategory: this.getLabel(this.mainCategories, this.selectedMainCategory),
      subCategory: this.getLabel(this.subCategories, this.selectedSubCategory),
      productType: this.getLabel(this.productTypes, this.selectedProductType),
      details: this.getLabel(this.detailsOptions, this.selectedDetails),
      buyer: this.buyerData,
      status: 'pending',
    };

    console.log('Buyer Inquiry Submitted:', submissionData);
    
    // Save to localStorage for future reference
    localStorage.setItem('lastBuyerSubmission', JSON.stringify(submissionData));
    
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
   * Submit another inquiry
   */
  submitAnother(): void {
    this.currentView = 'form';
    this.resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    this.submittedData = null;
  }
}
