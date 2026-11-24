import { signal, Signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

export abstract class BaseCrudService<T extends { id: string | number }> {
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly itemsSignal = signal<T[]>([]);
  readonly items: Signal<T[]> = this.itemsSignal.asReadonly();
  protected readonly loadingSignal = signal<boolean>(false);
  readonly loading: Signal<boolean> = this.loadingSignal.asReadonly();
  protected readonly errorSignal = signal<string | null>(null);
  readonly error: Signal<string | null> = this.errorSignal.asReadonly();

  protected abstract storageKey: string;
  protected initialData: T[] = [];

  protected initStorage(defaults: T[] = []): void {
    this.initialData = defaults;
    this.itemsSignal.set(this.loadFromStorage(defaults));
  }

  protected loadFromStorage(defaults: T[] = this.initialData): T[] {
    if (!isPlatformBrowser(this.platformId)) return defaults;
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore corrupted storage
    }
    this.saveToStorage(defaults);
    return defaults;
  }

  protected persist(items: T[]): void {
    this.itemsSignal.set(items);
    this.saveToStorage(items);
  }

  protected saveToStorage(items: T[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving to storage key: ${this.storageKey}`, e);
    }
  }

  protected formatTimestamp(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${y}-${m}-${d} / ${time}`;
  }

  load(): void {
    this.itemsSignal.set(this.loadFromStorage(this.initialData));
  }

  getAll(): T[] {
    return this.itemsSignal();
  }

  getById(id: string | number): T | undefined {
    return this.itemsSignal().find(item => String(item.id) === String(id));
  }

  add(item: T): any {
    const updated = [item, ...this.itemsSignal()];
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return item;
  }

  add$(item: T): Observable<T> {
    const updated = [item, ...this.itemsSignal()];
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return of(item);
  }

  update(id: string | number, partial: Partial<T>): any {
    const current = this.itemsSignal();
    const index = current.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    const updatedItem = { ...current[index], ...partial };
    const nextList = [...current];
    nextList[index] = updatedItem;
    this.itemsSignal.set(nextList);
    this.saveToStorage(nextList);
    return updatedItem;
  }

  update$(id: string | number, partial: Partial<T>): Observable<T> {
    const current = this.itemsSignal();
    const index = current.findIndex(item => String(item.id) === String(id));
    if (index !== -1) {
      const updatedItem = { ...current[index], ...partial };
      const nextList = [...current];
      nextList[index] = updatedItem;
      this.itemsSignal.set(nextList);
      this.saveToStorage(nextList);
      return of(updatedItem);
    }
    return of(current[0]);
  }

  delete(id: string | number): any {
    const updated = this.itemsSignal().filter(item => String(item.id) !== String(id));
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return true;
  }

  delete$(id: string | number): Observable<void> {
    const updated = this.itemsSignal().filter(item => String(item.id) !== String(id));
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return of(void 0);
  }

  deleteMultiple(ids: (string | number)[]): any {
    const idSet = new Set(ids.map(String));
    const updated = this.itemsSignal().filter(item => !idSet.has(String(item.id)));
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return true;
  }

  deleteMultiple$(ids: (string | number)[]): Observable<void> {
    const idSet = new Set(ids.map(String));
    const updated = this.itemsSignal().filter(item => !idSet.has(String(item.id)));
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return of(void 0);
  }

  bulkDelete(ids: (string | number)[]): any {
    return this.deleteMultiple$(ids);
  }
}
