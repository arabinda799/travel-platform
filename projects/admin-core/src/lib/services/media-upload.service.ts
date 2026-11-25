import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from './api.service';

export interface UploadResponse {
  id: string;
  url: string;
  relativePath?: string;
}

@Injectable({ providedIn: 'root' })
export class MediaUploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  uploadFile(file: File, moduleName = 'platform', moduleId = 'logos'): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('moduleName', moduleName);
    formData.append('moduleId', moduleId);

    return this.http.post<any>(`${this.baseUrl}/media/upload`, formData).pipe(
      map(res => {
        const data = res?.data ?? res;
        const rawUrl = data.url || data.relativePath || '';
        return {
          id: data.id,
          url: this.resolveUrl(rawUrl),
          relativePath: rawUrl,
        };
      })
    );
  }

  /**
   * Resolves relative `/uploads/...` to an absolute URL pointing to the API host origin for <img src>.
   */
  resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    try {
      const parsed = new URL(this.baseUrl);
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${parsed.origin}${cleanPath}`;
    } catch {
      return url;
    }
  }
}
