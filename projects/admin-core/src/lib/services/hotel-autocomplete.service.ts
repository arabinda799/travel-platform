import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AutocompleteCity {
  id: number | string;
  name: string;
  country: string;
  type: 'city';
  hotelsCount?: number;
}

export interface AutocompleteHotel {
  id: string;
  hid: number;
  name: string;
  address: string;
  starRating?: number;
  type: 'hotel';
}

export interface AutocompleteResult {
  cities: AutocompleteCity[];
  hotels: AutocompleteHotel[];
}

@Injectable({ providedIn: 'root' })
export class HotelAutocompleteService {
  private readonly api = inject(ApiService);

  search(query: string): Observable<AutocompleteResult> {
    const q = (query || '').trim();
    if (q.length < 2) {
      return of({ cities: [], hotels: [] });
    }

    return this.api.get<any>('/hotel/autocomplete', { q }).pipe(
      map(res => {
        const data = res?.data ?? res ?? {};
        return {
          cities: Array.isArray(data.cities) ? data.cities : [],
          hotels: Array.isArray(data.hotels) ? data.hotels : [],
        };
      }),
      catchError(() => of({ cities: [], hotels: [] }))
    );
  }

  searchCities(query: string): Observable<AutocompleteCity[]> {
    return this.search(query).pipe(map(r => r.cities));
  }

  searchHotels(query: string): Observable<AutocompleteHotel[]> {
    return this.search(query).pipe(map(r => r.hotels));
  }
}
