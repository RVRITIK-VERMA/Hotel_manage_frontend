import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotelApiService } from '../hotel-api.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule,HttpClientModule,CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  name: string = '';
  selectedUser: string = '';
  usersList: any[] = [];

  constructor(private router: Router, private hotelService:HotelApiService,private toastr : ToastrService ) {}

  ngOnInit(): void {
    this.loadUsers();
  }
 
  loadUsers(){
    this.hotelService.getUsers().subscribe((data: any) => {
      if (data && data.result) {
        this.usersList = data.result;
      }
    });
  }

  bindUser(): void {
    this.name = this.selectedUser;
  }

  onEnter() {
    if (this.name === '') {
      this.toastr.error('Please enter a user name !.');
      return;
    }
    let obj = { name : this.name , action : 'RegisterUser' , roomsBooked:'', totalBooked:0};
    this.hotelService.registerUser(obj).subscribe((response) => {
      //this name from local storage will be used to get,set rooms for user
      localStorage.setItem('userName', this.name);

      // Navigate to booking page
      this.router.navigate(['/booking']);
    });
  }
}
