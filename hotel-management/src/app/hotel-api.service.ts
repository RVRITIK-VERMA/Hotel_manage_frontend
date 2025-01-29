import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class HotelApiService {
  constructor(private http: HttpClient) { }

  //Register new user on home page (while entering user name)
  registerUser(obj:object): Observable<any> {
    return this.http.post(`${environment.api_url}/api/owner/register`, obj);
  }

  //Get all rooms
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api_url}/api/rooms/getAllRooms`);
  }

  //Get all users for dropdown on first page
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api_url}/api/owner/getAllUsers`);
  }

  //Get count of all rooms which are vacant
  getTotalVacantRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api_url}/api/rooms/getCountOfVacantRoom`);
  }

  //Get all rooms booked by user
  getRoomsBookedByUser(obj:object): Observable<any> {
    return this.http.post(`${environment.api_url}/api/owner/getOwnerData`, obj);
  }

  //Book rooms for user optimally for the input
  getOptimalRooms(obj:object): Observable<any> {
    return this.http.post(`${environment.api_url}/api/rooms/optimalRooms`, obj);
  }

  //Get random rooms for admin
  getRandomRoomsForAdmin(obj:object): Observable<any> {
    return this.http.post(`${environment.api_url}/api/rooms/getRandomRooms`, obj);
  }

}
