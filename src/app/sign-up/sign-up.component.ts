import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  email = '';
  password = '';
  username = '';

  constructor(private router: Router, private authService: AuthService) {}

  OnRegister() {
    this.router.navigateByUrl('/register');
  }

  onLogin() {
    const loginData = {
      Email: this.email,
      passwordHash: this.password,
      Username: this.username
    };

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.authService.saveUserData(response.token, response.role);
        if (response.role === 'Admin') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: err => {
        console.error('Login failed:', err);
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
