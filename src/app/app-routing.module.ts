import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { RoleGuard } from './guards/role.guard';
import { DoctorsPageComponent } from './doctors-page/doctors-page.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: SignUpComponent },
  { path: 'register', component: RegisterComponent },
  {path:'doctor',component:DoctorsPageComponent},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'User' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'Admin' }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
