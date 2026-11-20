import { Component, ElementRef, ViewChild, afterNextRender, computed, inject, input, output, signal } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';
import { Menu } from 'primeng/menu';
import { Badge } from 'primeng/badge';
import { Avatar } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'lib-header',
  imports: [Menu, Badge, Avatar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly sidebarService = inject(SidebarService);

  // Mobile search state signal
  readonly isMobileSearchOpen = signal<boolean>(false);
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  // Theme state signal — defaults to light, persisted in sessionStorage
  readonly currentTheme = signal<'dark' | 'light'>(
    (() => {
      if (typeof window === 'undefined') return 'light';
      try {
        const saved = sessionStorage.getItem('admin_theme') as 'dark' | 'light' | null;
        const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        return theme;
      } catch {
        document.documentElement.setAttribute('data-theme', 'light');
        return 'light';
      }
    })()
  );

  // Dynamic user inputs with defaults
  readonly userName = input<string>('Super Admin');
  readonly userInitials = input<string>('SA');
  readonly userRole = input<string>('Super Admin Role');
  readonly userEmail = input<string>('admin@travelplatform.com');
  readonly notificationCount = input<string>('3');

  // User menu outputs
  readonly profileSelected = output<void>();
  readonly auditLogsSelected = output<void>();
  readonly signOut = output<void>();

  readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Signed in as',
      items: [
        { label: this.userEmail(), disabled: true },
        { label: this.userRole(), disabled: true },
      ],
    },
    { separator: true },
    {
      label: 'Profile & Settings',
      icon: 'person',
      command: () => this.profileSelected.emit(),
    },
    {
      label: 'Audit Logs',
      icon: 'history',
      command: () => this.auditLogsSelected.emit(),
    },
    { separator: true },
    {
      label: 'Sign Out',
      icon: 'logout',
      command: () => this.signOut.emit(),
    },
  ]);

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarService.toggleMobile();
    } else {
      this.sidebarService.toggleCollapse();
    }
  }

  toggleTheme(): void {
    if (typeof document === 'undefined') return;
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try { sessionStorage.setItem('admin_theme', newTheme); } catch { /* blocked */ }
  }

  openMobileSearch(): void {
    this.isMobileSearchOpen.set(true);
    requestAnimationFrame(() => {
      this.searchInput?.nativeElement.focus();
    });
  }

  closeMobileSearch(): void {
    this.isMobileSearchOpen.set(false);
  }

  toggleMobileSearch(): void {
    if (this.isMobileSearchOpen()) {
      this.closeMobileSearch();
    } else {
      this.openMobileSearch();
    }
  }
}
