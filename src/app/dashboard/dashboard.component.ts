import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  selectedSection = 'myProfile';
  constructor(private authService:AuthService){}

  logout(){
    this.authService.logout();
  }

  selectSection(section:string){
    this.selectedSection=section;
  }


}
