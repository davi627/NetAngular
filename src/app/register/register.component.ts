import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = ''; // Add role field

  constructor(private router: Router, private http: HttpClient) {}

  register() {
    const body = {
      Username: this.username,
      Email: this.email,
      PasswordHash: this.password,
      Role: this.role 
    };
  
    this.http.post('http://localhost:5077/api/auth/register', body).subscribe({
      next: (res: any) => {
        console.log('Registration successful:', res);
        if (res.success) {
          alert('Registration successful');
          this.router.navigateByUrl('/login');
        } else {
          alert('Registration failed. Please try again.');
        }
      },
      error: (err) => {
        console.error('Registration failed:', err);
        alert('Registration failed. Please try again.');
      }
    });
  }
  
  login() {
    this.router.navigateByUrl('/login');
  }
}
