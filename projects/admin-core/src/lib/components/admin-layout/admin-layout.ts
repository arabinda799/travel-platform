import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './header/header';
import { SidebarComponent } from './sidebar/sidebar';
import { FooterComponent } from './footer/footer';
import { NavItem } from '../../interfaces/nav-item';
import { AuthService } from '../../services/auth.service';
import { PageModeService } from '../../services/page-mode.service';

@Component({
  selector: 'lib-admin-layout',
  imports: [ToastModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly pageModeService = inject(PageModeService);

  readonly isCurrentPageStatic = this.pageModeService.isStatic;
  readonly flagMinimized = signal<boolean>(false);

  readonly navItems = input<NavItem[]>([]);

  // User profile inputs
  readonly userName = input<string>('Super Admin');
  readonly userInitials = input<string>('SA');
  readonly userRole = input<string>('Super Admin Role');
  readonly userEmail = input<string>('admin@travelplatform.com');
  readonly notificationCount = input<string>('3');
  readonly systemStatus = input<string>('Systems Operational');

  // Forwarding outputs
  readonly profileSelected = output<void>();
  readonly auditLogsSelected = output<void>();
  readonly signOut = output<void>();

  onProfileSelected(): void {
    this.profileSelected.emit();
    this.router.navigate(['/system/settings/profile']);
  }

  onAuditLogsSelected(): void {
    this.auditLogsSelected.emit();
    this.router.navigate(['/system/logs/login']);
  }

  onSignOut(): void {
    this.signOut.emit();
    this.authService.logout();
  }
}

