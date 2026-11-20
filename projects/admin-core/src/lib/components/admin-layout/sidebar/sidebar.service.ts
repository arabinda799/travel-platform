import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  /** Desktop collapsed state (icon-only mode) - default true */
  readonly isCollapsed = signal<boolean>(true);

  /** Mobile drawer open/close state */
  readonly isMobileOpen = signal<boolean>(false);

  toggleCollapse(): void {
    this.isCollapsed.update((val) => !val);
  }

  setCollapse(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }

  toggleMobile(): void {
    this.isMobileOpen.update((val) => !val);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }
}
