import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { Badge } from 'primeng/badge';
import { SidebarService } from './sidebar.service';
import { NavItem } from '../../../interfaces/nav-item';

@Component({
  selector: 'lib-sidebar',
  imports: [RouterLink, RouterLinkActive, Tooltip, Badge],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly sidebarService = inject(SidebarService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Dynamic Navigation Items
  readonly items = input<NavItem[]>([]);

  // Logout output event
  readonly logout = output<void>();

  get isCollapsed(): boolean {
    return this.sidebarService.isCollapsed();
  }

  get isMobileOpen(): boolean {
    return this.sidebarService.isMobileOpen();
  }

  closeMobile(): void {
    this.sidebarService.closeMobile();
  }

  onLinkClick(): void {
    if (this.isMobileOpen) {
      this.closeMobile();
    }
  }

  onLogout(): void {
    this.logout.emit();
  }

  toggleSubmenu(item: NavItem): void {
    if (this.isCollapsed) {
      this.sidebarService.toggleCollapse();
    }
    item.expanded = !item.expanded;
    this.cdr.markForCheck();
  }
}
