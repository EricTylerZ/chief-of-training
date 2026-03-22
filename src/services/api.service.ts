import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(path, { withCredentials: true });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(path, body ?? {}, { withCredentials: true });
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(path, body, { withCredentials: true });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(path, { withCredentials: true });
  }
}
