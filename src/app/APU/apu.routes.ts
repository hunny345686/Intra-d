import { Routes } from '@angular/router';
import { BuyerComponent } from './buyer/buyer.component';
import { SellerComponent } from './seller/seller.component';
import { AuthGuard } from '../guards/auth.guard';

export const APU_ROUTES: Routes = [
  { path: '', redirectTo: 'buyer', pathMatch: 'full' },
  { 
    path: 'buyer', 
    component: BuyerComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'seller', 
    component: SellerComponent,
    canActivate: [AuthGuard]
  }
];