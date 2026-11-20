export interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  badge?: string | number;
  badgeSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  children?: NavItem[];
  expanded?: boolean;
  external?: boolean;
  isSection?: boolean;
}
