import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  email: string = '';
  password: string = '';
  username:string='';

  constructor(private route: Router, private http: HttpClient) {}

  OnRegister() {
    this.route.navigateByUrl('/register');
  }

  onLogin() {
    const loginData = {
      Email: this.email,
      passwordHash: this.password,
      Username:this.username
    };

    this.http.post('http://localhost:5077/api/auth/login', loginData).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        // optionally save token
        // localStorage.setItem('token', response.token);
        this.route.navigateByUrl('/dashboard'); 
      },
      error: err => {
        console.error('Login failed:', err);
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
