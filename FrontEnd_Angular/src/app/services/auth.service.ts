import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private apiUrl = "http://127.0.0.1:5000"
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    console.log("Login Triggred",username, password)
    return this.http.post<{access_token: string}>(`${this.apiUrl}/login`, { username, password }) // Replace with your API endpoint
      .pipe(
        map(response => {
          
          if (response && response.access_token) {
            localStorage.setItem('token', response.access_token);
            this.loggedIn = true;
            return true;  // Return true indicating successful login
          }
          return false;  // Return false if no token is present
        }),
        catchError(() => of(false))  // In case of error, return false
      );
  }
    // New register method
    register(username: string, password: string): Observable<boolean> {
      console.log("Registration Triggered", username);
      return this.http.post<{success: boolean, message: string}>(`${this.apiUrl}/register`, { username, password })
        .pipe(
          map(response => {
            if (response && response.success) {

              return true;
            }
            return false;
          }),
          catchError((error) => {
            console.error('Registration error:', error);
            return of(false);
          })
        );
    }
  isLoggedIn(): boolean {
    return this.loggedIn || !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn = false;
  }
}
