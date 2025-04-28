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
  rescheduleDate: string = '';
  rescheduleTime: string = '';
  cancelNote: string = '';
  selectedAppointmentId: number | null = null;
  showRescheduleModal: boolean = false;

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
  //opening the module for the rescheduling
  openRescheduleModal(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.showRescheduleModal = true;
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
      next: (res) => console.log('Doctors loaded', res),
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
//sending the rejection of appointment with the reschedule info
submitReschedule(): void {
  if (!this.selectedAppointmentId) return;

  const payload = {
    status: 'Rescheduled',
    proposedNewDate: this.rescheduleDate,
    proposedNewTime: this.rescheduleTime,
    cancellationNote: this.cancelNote
  };

  this.appointmentsService.updateAppointmentStatus(this.selectedAppointmentId, payload).subscribe({
    next: () => {
      this.loadAppointments(); 
      this.showRescheduleModal = false;
      this.selectedAppointmentId = null;
      this.rescheduleDate = '';
      this.rescheduleTime = '';
      this.cancelNote = '';
    },
    error: (err) => console.error('Error updating with reschedule', err)
  });
}

  
  logout(){
    this.authService.logout()
  }
}
