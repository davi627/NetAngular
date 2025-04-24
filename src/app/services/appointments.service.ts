import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: number;
  date: string;
  time: string;
  doctorName: string;
  department: string;
  reason:string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  private baseUrl = 'http://localhost:5077/api/appointments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 📌 Book a new appointment
  bookAppointment(data: Appointment): Observable<any> {
    return this.http.post(this.baseUrl, data, {
      headers: this.getAuthHeaders()
    });
  }

  // 📌 Get user's appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // 📌 Cancel an appointment by ID
  cancelAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
