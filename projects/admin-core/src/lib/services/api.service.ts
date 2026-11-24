import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private unwrap<T>(res: any): T {
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      if (res.meta !== undefined) {
        return res as T;
      }
      return res.data as T;
    }
    return res as T;
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    }
    return this.http.get<any>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      map(res => this.unwrap<T>(res))
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<any>(`${this.baseUrl}${path}`, body).pipe(
      map(res => this.unwrap<T>(res))
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<any>(`${this.baseUrl}${path}`, body).pipe(
      map(res => this.unwrap<T>(res))
    );
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<any>(`${this.baseUrl}${path}`, body).pipe(
      map(res => this.unwrap<T>(res))
    );
  }

  delete<T>(path: string, body?: unknown): Observable<T> {
    return this.http.delete<any>(`${this.baseUrl}${path}`, body !== undefined ? { body } : undefined).pipe(
      map(res => this.unwrap<T>(res))
    );
  }
}
