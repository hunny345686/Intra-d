import { Routes } from '@angular/router';

// FPC Components
import { HomepageComponent } from './FPC/Homepage/homepage.component';
import { CareerComponent } from './FPC/career/career.component';
import { BookSoilComponent } from './FPC/book-soil/book-soil.component';
import { AboutUsComponent } from './FPC/about-us/about-us.component';
import { ContactUsComponent } from './FPC/contact-us/contact-us.component';
import { LoginComponent } from './FPC/login/login.component';
import { ProductListComponent } from './FPC/product-list/product-list.component';
import { ProductDetailComponent } from './FPC/product-detail/product-detail.component';

// Dashboard Components
import { UserDashboardComponent } from './dashboards/user-dashboard.component';
import { FarmerDashboardComponent } from './dashboards/farmer-dashboard.component';
import { AppControlComponent } from './app-control/app-control.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ReportComponent } from './report/report.component';

// Guards
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public FPC Routes
  { path: '', component: HomepageComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'career', component: CareerComponent },
  { path: 'booksoil', component: BookSoilComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'contact', component: ContactUsComponent },
  { path: 'crops/:category', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  
  // Protected Routes
  {
    path: 'control',
    component: AppControlComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'buyer',
    component: UserDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: 'user' }
  },
  {
    path: 'apu',
    loadChildren: () => import('./APU/apu.routes').then(m => m.APU_ROUTES)
  },
  {
    path: 'seller',
    component: FarmerDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: 'farmer' }
  },
  {
    path: 'report',
    component: ReportComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  
  { path: '**', redirectTo: '' }
];
