import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelApiService } from '../hotel-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss'
})



export class BookingPageComponent implements OnInit {
  userName: string = '';
  rooms: [] = [];
  numberOfRoomsReq: number = 0;
  floors: Array<any> = [];
  roomExistsForUser: boolean = false;
  isLoading = false; // Initially, loader is hidden
  totalVacantRooms: number = 0;
  roomsOccupiedByUser :number = 0;


  constructor(private router:Router, private hotelService:HotelApiService,private toastr: ToastrService) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || 'Guest';
    if (this.userName === 'Guest') {
      this.router.navigate(['/']);  // Redirect to home page if by somehow there is no name set in local storage
    } else {
      this.getRooms();  // Proceed to get rooms 
    }
  }

  //Get all rooms 
  getRooms(){
    this.hotelService.getRooms().subscribe((data: any) => {
      if (data && data.result) {
        this.rooms = data.result; 
        this.groupRoomsByFloor(this.rooms); 

        //call for rooms booked by current user
        this.assignRoomsforUser();

        //count of vacant rooms
        this.getTotalVancantRooms();
      }
    });
  }

  //After retrieving rooms, group them by floor and sort them by room number and floor number so that they can be displayed in the UI
  groupRoomsByFloor(rooms: Array<any>) {
    const groupedFloors = new Map<number, Array<any>>();
  
    rooms.forEach(room => {
      // Add selected property to each room
      room.selected = false; // Initially, no room is selected
  
      if (!groupedFloors.has(room.floor_number)) {
        groupedFloors.set(room.floor_number, []);
      }
  
      // Push room into the appropriate floor array
      groupedFloors.get(room.floor_number)?.push(room);
    });
  
    // Convert the Map into an array for `floors`
    this.floors = Array.from(groupedFloors, ([floor_number, rooms]) => ({
      floor_number,
      rooms: rooms.sort((a, b) => a.room_number - b.room_number) // Sort rooms by room_number
    }));
  
    // Sort floors by floor_number
    this.floors.sort((a, b) => a.floor_number - b.floor_number);
  }
  
  
  //To mark and display rooms booked by user
  assignRoomsforUser() {
    this.isLoading = true; // Show loader
    let obj = {
      ownerName: this.userName
    };
    console.log("getting room data");
    this.hotelService.getRoomsBookedByUser(obj).subscribe((data: any) => {
      if (data && data.result) {
        this.isLoading = false; // Show loader
        const roomsBookedByUser = data.result.rooms_booked;
  
        // Remove trailing comma and split into an array of numbers
        const roomsArray = roomsBookedByUser.trim().replace(/,$/, '').split(',').map(Number);
        console.log(roomsArray);
        if(roomsArray.length > 0 && roomsArray[0] != 0){
          this.roomExistsForUser = true;
          this.roomsOccupiedByUser = roomsArray.length;
        }
        else{
          this.roomExistsForUser = false;
          this.roomsOccupiedByUser = 0;
        }
        console.log(this.roomExistsForUser);
        // Mark rooms as selected based on the `room_number`
        this.rooms.forEach((room: any) => {
          if (roomsArray.includes(room.room_number)) {
            room.selected = true;
          }
        });

        // console.log("afterbooking",this.floors);
      }
    });
  }
  
  //To book rooms for user
  bookRooms() {
    // validations for number of rooms
    if (this.numberOfRoomsReq == 0 || this.numberOfRoomsReq == null || this.numberOfRoomsReq == undefined || this.numberOfRoomsReq<0) {
      this.toastr.error('Number of Rooms can be valid positive number', 'Error');
      return;
    }
    else if (this.numberOfRoomsReq > 5) {
      this.toastr.error('Number of Rooms cannot be more than 5!', 'Error');
      return;
    }
    else if (this.numberOfRoomsReq > this.totalVacantRooms) {
      this.toastr.error('Number of Rooms cannot be more than available rooms!', 'Error');
      return;
    }

    let obj = {
      numberOfRooms : this.numberOfRoomsReq
    }
    this.hotelService.getOptimalRooms(obj).subscribe((data: any) => {
      if (data && data.result) {
        console.log(data.result);
        let roomList= ''
        data.result.forEach((room: any) => {
          roomList = roomList + room.roomNumber + ',';
        });
        let obj = {
          action : "InsertUpdateBooking",
          name : this.userName,
          roomsBooked : roomList,
          totalBooked : this.numberOfRoomsReq
        };
        this.hotelService.registerUser(obj).subscribe((response) => {
          this.toastr.success('Rooms booked successfully!', 'Success');
          // On success, load rooms again
          this.getRooms();
        });
      }
    });
  }

  resetRooms() {
    // Reset all selections
    let obj = {
      action : "ResetBooking",
      name : this.userName,
      roomsBooked : '',
      totalBooked : 0
    }
    this.hotelService.registerUser(obj).subscribe((response) => {
      // On success, show latest status of rooms
      this.toastr.info('booking Reset Successfully!', 'Info');
      this.getRooms();
    });
  }

  //Randomly select rooms for admin (Admin only)
  randomBooking() {
    if (this.numberOfRoomsReq == 0 || this.numberOfRoomsReq == null || this.numberOfRoomsReq == undefined || this.numberOfRoomsReq<0) {
      this.toastr.error('Number of Rooms can be valid positive number', 'Error');
      return;
    }
    else if (this.numberOfRoomsReq > 5) {
      this.toastr.error('Number of Rooms cannot be more than 5!', 'Error');
      return;
    }
    else if (this.numberOfRoomsReq > this.totalVacantRooms) {
      this.toastr.error('Number of Rooms cannot be more than available rooms!', 'Error');
      return;
    }
    // Randomly select rooms (only for admin)
    this.isLoading = true; // Show loader
    let obj = {
      numberOfRooms : this.numberOfRoomsReq
    }
    this.hotelService.getRandomRoomsForAdmin(obj).subscribe((data: any) => {
      if (data && data.result) {
        console.log(data.result);
        let roomList= ''
        roomList = data.result[0].available_rooms;
        let obj = {
          action : "InsertUpdateBooking",
          name : this.userName,
          roomsBooked : roomList,
          totalBooked : this.numberOfRoomsReq
        };
        this.hotelService.registerUser(obj).subscribe((response) => {
          this.toastr.success('Rooms booked successfully!', 'Success');
          // On success, navigate to booking page
          this.getRooms();
        });
        this.isLoading = false; // Hide loader
      }
    });
  }

  //Get total vacant rooms
  getTotalVancantRooms() {
    this.hotelService.getTotalVacantRooms().subscribe((data: any) => {
      if (data && data.result) {
        console.log(data.result);
        this.totalVacantRooms =  data.result[0].available_rooms;
        this.totalVacantRooms = isNaN(Number(data.result[0].available_rooms)) ? 0 : Number(data.result[0].available_rooms);
      }
    });
  }

  //Reset all bookings (Admin only)
  resetAllBooking() {
    const confirmation = window.confirm('Are you sure you want to delete all bookings? This action cannot be undone.');
  
    if (!confirmation) {
      return;
    }
  
    // Proceed with the booking reset
    let obj = {
      action: "ResetAllBooking",
      name: this.userName,
      roomsBooked: '',
      totalBooked: 0
    };
  
    this.hotelService.registerUser(obj).subscribe((response) => {
      // On success, display a toaster message and refresh the rooms
      this.toastr.info('All Bookings Deleted Successfully!', 'Info');
      this.getRooms();
    });
  }
  

  logout() {
    // Clear user name from local storage
    localStorage.removeItem('userName');
  
    // Navigate back to login page
    this.router.navigate(['/']);
  }

  //Delete all users and their data (Admin only Note-Data for admin will not be reset from here as it is the current user)
  deleteAllUser() {
    const confirmation = window.confirm('Are you sure you want to delete all users and thier data except admin ? This action cannot be undone.');
  
    if (!confirmation) {
      // User clicked "Cancel," exit the function
      return;
    }
  
    // Proceed with the booking reset
    let obj = {
      action: "deleteAllUserAndData",
      name: this.userName,
      roomsBooked: '',
      totalBooked: 0
    };
  
    this.hotelService.registerUser(obj).subscribe((response) => {
      // On success, display a toaster message and refresh the rooms
      this.toastr.info('All User and Bookings Data Deleted Successfully!', 'Info');
      this.getRooms();
    });
  }

}