import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: number;
  date: string;
  time: string;
  doctorName: string;
  department: string;
  reason: string;
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

  bookAppointment(data: Appointment): Observable<any> {
    return this.http.post(this.baseUrl, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doctors`, {
      headers: this.getAuthHeaders()
    });
  }

  cancelAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateAppointmentStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { status }, {
      headers: this.getAuthHeaders()
    });
  }
}
