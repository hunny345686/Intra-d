import { Routes } from '@angular/router';
import { BuyerComponent } from './APU/buyer/buyer.component';
import { SellerComponent } from './APU/seller/seller.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: BuyerComponent },
  { path: 'buyer', component: BuyerComponent },
  { path: 'seller', component: SellerComponent },
  { path: 'processing', component: BuyerComponent }, // Can be replaced with processing component
  { path: '**', redirectTo: 'dashboard' }
];