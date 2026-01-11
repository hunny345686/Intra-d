import { Routes } from '@angular/router';
import { BuyerComponent } from './buyer/buyer.component';
import { SellerComponent } from './seller/seller.component';

export const APU_ROUTES: Routes = [
  { path: '', redirectTo: 'buyer', pathMatch: 'full' },
  { path: 'buyer', component: BuyerComponent },
  { path: 'seller', component: SellerComponent }
];