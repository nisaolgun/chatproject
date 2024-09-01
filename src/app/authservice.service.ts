import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  private apiUrl = 'http://192.168.1.77:8888';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap(() => this.openSnackBar('Kayıt başarılı')),
      catchError(error => {
        console.error('Kayıt başarısız', error);
        throw error;
      })
    );
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  logout(): Observable<any> {
    this.removeToken();
    return this.http.post(`${this.apiUrl}/logout`, null);
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-toast']
    });
  }

 
  private addTokenToHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  private getHttpOptions(): any {
    return {
      headers: this.addTokenToHeaders()
    };
  }

  public httpOptions = this.getHttpOptions();
}
