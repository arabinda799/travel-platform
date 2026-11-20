import { signal, Signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export abstract class BaseCrudService<T extends { id: string }> {
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly itemsSignal = signal<T[]>([]);
  readonly items: Signal<T[]> = this.itemsSignal.asReadonly();

  protected abstract storageKey: string;

  protected loadFromStorage(defaults: T[] = []): T[] {
    if (!isPlatformBrowser(this.platformId)) return defaults;
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore corrupted storage
    }
    return defaults;
  }

  protected saveToStorage(items: T[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving to storage key: ${this.storageKey}`, e);
    }
  }

  getAll(): T[] {
    return this.itemsSignal();
  }

  getById(id: string): T | undefined {
    return this.itemsSignal().find(item => item.id === id);
  }

  add(item: T): T {
    const updated = [item, ...this.itemsSignal()];
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return item;
  }

  update(id: string, partial: Partial<T>): T | null {
    const current = this.itemsSignal();
    const index = current.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = { ...current[index], ...partial };
    const nextList = [...current];
    nextList[index] = updatedItem;
    this.itemsSignal.set(nextList);
    this.saveToStorage(nextList);
    return updatedItem;
  }

  delete(id: string): boolean {
    const updated = this.itemsSignal().filter(item => item.id !== id);
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return true;
  }

  deleteMultiple(ids: string[]): boolean {
    const idSet = new Set(ids);
    const updated = this.itemsSignal().filter(item => !idSet.has(item.id));
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
    return true;
  }
}
