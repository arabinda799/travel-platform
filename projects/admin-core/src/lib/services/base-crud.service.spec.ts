import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';

interface MockItem {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
class TestCrudService extends BaseCrudService<MockItem> {
  protected override storageKey = 'test_crud_key';
}

describe('BaseCrudService', () => {
  let service: TestCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestCrudService],
    });
    service = TestBed.inject(TestCrudService);
    // clear items
    service['itemsSignal'].set([]);
  });

  it('adds an item to the top of list', () => {
    service.add({ id: '1', name: 'Item 1' });
    service.add({ id: '2', name: 'Item 2' });

    expect(service.getAll().length).toBe(2);
    expect(service.getAll()[0].id).toBe('2');
  });

  it('updates an existing item', () => {
    service.add({ id: '1', name: 'Item 1' });
    const updated = service.update('1', { name: 'Item 1 Updated' });

    expect(updated?.name).toBe('Item 1 Updated');
    expect(service.getById('1')?.name).toBe('Item 1 Updated');
  });

  it('returns null when updating non-existent item', () => {
    const updated = service.update('999', { name: 'Non-existent' });
    expect(updated).toBeNull();
  });

  it('deletes an item by id', () => {
    service.add({ id: '1', name: 'Item 1' });
    service.add({ id: '2', name: 'Item 2' });

    service.delete('1');
    expect(service.getAll().length).toBe(1);
    expect(service.getById('1')).toBeUndefined();
  });

  it('deletes multiple items by ids', () => {
    service.add({ id: '1', name: 'Item 1' });
    service.add({ id: '2', name: 'Item 2' });
    service.add({ id: '3', name: 'Item 3' });

    service.deleteMultiple(['1', '3']);
    expect(service.getAll().length).toBe(1);
    expect(service.getAll()[0].id).toBe('2');
  });
});
