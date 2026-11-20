import { TemplateRef } from '@angular/core';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  bodyTemplate?: TemplateRef<any>;
  headerTemplate?: TemplateRef<any>;
  frozen?: boolean;
  frozenAlign?: 'left' | 'right';
}

export interface TableLazyEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
  filters?: Record<string, any>;
}

export interface TablePageState {
  page: number;
  pageSize: number;
  total: number;
  sortField?: string;
  sortOrder?: 1 | -1;
}
