import { Component, OnInit } from '@angular/core';
import { AppointmentsService, Appointment } from '../services/appointments.service';
import { AuthService, User } from '../services/auth.service';

interface UserProfile {
  username: string;
  email?: string;
  role?: string;
}

@Component({
  selector: 'app-doctors-page',
  templateUrl: './doctors-page.component.html',
  styleUrls: ['./doctors-page.component.css']
})
export class DoctorsPageComponent implements OnInit {

  doctorAppointments: Appointment[] = [];
  doctorName: string = '';
  userProfile: User | null = null;

  constructor(
    private appointmentsService: AppointmentsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res: User) => {
        this.userProfile = res;
        this.doctorName = res.username;
        this.loadAppointments();
        this.loadDoctors();
      },
      error: (err) => console.error('Error fetching profile', err)
    });
  }

  loadAppointments(): void {
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.doctorAppointments = appointments.filter(
          (appointment) =>
            appointment.doctorName.toLowerCase() === this.doctorName.toLowerCase()
        );
      },
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  loadDoctors(): void {
    this.appointmentsService.getDoctors().subscribe({
      next: (res) => console.log('Doctors loaded', res), // Replace with your actual logic
      error: (err) => console.error('Error loading doctors', err)
    });
  }

  updateStatus(id: number, status: string): void {
    this.appointmentsService.updateAppointmentStatus(id, status).subscribe({
      next: () => {
        // Update the status locally to reflect changes immediately
        const target = this.doctorAppointments.find(a => a.id === id);
        if (target) {
          target.status = status;
        }

      },
      error: (err) => console.error('Status update error:', err)
    });
  }
  
  
  logout(){
    this.authService.logout()
  }
}
