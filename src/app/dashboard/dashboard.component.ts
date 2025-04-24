import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AppointmentsService, Appointment } from '../services/appointments.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  
  doctors: any[] = [];
  selectedSection = 'myProfile';
  userProfile: any;

  appointmentForm!: FormGroup;
  appointments: Appointment[] = [];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.userProfile = res;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
      }
    });
  
    this.initForm();
    this.loadAppointments();
    this.loadDoctors(); // ← NEW
  }
  
  loadDoctors() {
    this.appointmentService.getDoctors().subscribe({
      next: (res) => this.doctors = res,
      error: (err) => console.error('Failed to load doctors:', err)
    });
  }
  

  logout() {
    this.authService.logout();
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }

  initForm() {
    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      doctorName: ['', Validators.required],
      department: ['', Validators.required],
      reason:['',Validators.required]
    });
  }

  bookAppointment() {
    if (this.appointmentForm.invalid) return;

    this.appointmentService.bookAppointment(this.appointmentForm.value).subscribe({
      next: () => {
        this.appointmentForm.reset();
        this.loadAppointments();
      },
      error: (err) => console.error('Booking error:', err)
    });
  }

  loadAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (res) => this.appointments = res,
      error: (err) => console.error('Fetch error:', err)
    });
  }

  cancelAppointment(id: number) {
    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Cancel error:', err)
    });
  }
}
