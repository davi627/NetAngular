import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the User interface here so it can be exported
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5077/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  saveUserData(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  getProfile() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get(`${this.baseUrl}/me`, { headers });
  }
  

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
  
  // Add proper return type for getAllUsers
  getAllUsers(): Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<User[]>(`${this.baseUrl}/users`, { headers });
  }
  
  deleteUser(id: number) {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }
  
  updateUser(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/users/${id}`, data);
  }
}