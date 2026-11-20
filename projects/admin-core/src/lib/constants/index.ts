export type EntityStatus = 'Active' | 'Inactive';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
}

export const STATUS_OPTIONS: SelectOption<EntityStatus>[] = [
  { label: 'Active', value: 'Active', description: 'Enable item for public usage' },
  { label: 'Inactive', value: 'Inactive', description: 'Temporarily disable item' },
];

export const META_ROBOTS_OPTIONS: SelectOption<string>[] = [
  { label: 'INDEX, FOLLOW', value: 'INDEX, FOLLOW' },
  { label: 'NOINDEX, FOLLOW', value: 'NOINDEX, FOLLOW' },
  { label: 'INDEX, NOFOLLOW', value: 'INDEX, NOFOLLOW' },
  { label: 'NOINDEX, NOFOLLOW', value: 'NOINDEX, NOFOLLOW' },
];

export const DATE_FORMAT_OPTIONS: SelectOption<string>[] = [
  { label: 'DD/MM/YYYY (19/11/2026)', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY (11/19/2026)', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD (2026-11-19)', value: 'YYYY-MM-DD' },
  { label: 'DD MMM YYYY (19 Nov 2026)', value: 'DD MMM YYYY' },
];

export const TIME_FORMAT_OPTIONS: SelectOption<string>[] = [
  { label: '12 Hours (03:30 PM)', value: '12h' },
  { label: '24 Hours (15:30)', value: '24h' },
];
