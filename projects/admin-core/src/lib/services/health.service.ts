import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from './api.service';

export interface HealthStatus {
  isHealthy: boolean;
  status: 'healthy' | 'unhealthy' | 'checking';
  timestamp: string | null;
  latencyMs: number | null;
  endpoint: string;
  error?: string | null;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly defaultBaseUrl = inject(API_BASE_URL);

  readonly statusSignal = signal<HealthStatus>({
    isHealthy: true,
    status: 'checking',
    timestamp: null,
    latencyMs: null,
    endpoint: '',
    error: null,
  });

  readonly health = this.statusSignal.asReadonly();

  constructor() {
    this.checkHealth().subscribe();
  }

  checkHealth(baseUrl?: string): Observable<HealthStatus> {
    const root = (baseUrl || this.defaultBaseUrl || 'https://api.easyflys.com/api/v1').replace(/\/+$/, '');
    const endpoint = `${root}/health`;
    const start = performance.now();

    this.statusSignal.update(s => ({ ...s, status: 'checking', endpoint }));

    return this.http.get<any>(endpoint).pipe(
      map(res => {
        const latencyMs = Math.round(performance.now() - start);
        const data = res?.data || res;
        const result: HealthStatus = {
          isHealthy: true,
          status: 'healthy',
          timestamp: data?.timestamp || new Date().toISOString(),
          latencyMs,
          endpoint,
          error: null,
        };
        this.statusSignal.set(result);
        return result;
      }),
      catchError(err => {
        const latencyMs = Math.round(performance.now() - start);
        const result: HealthStatus = {
          isHealthy: false,
          status: 'unhealthy',
          timestamp: null,
          latencyMs,
          endpoint,
          error: err?.message || 'API unreachable',
        };
        this.statusSignal.set(result);
        return of(result);
      })
    );
  }
}
