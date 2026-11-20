import { Component, input } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './header/header';
import { SidebarComponent } from './sidebar/sidebar';
import { FooterComponent } from './footer/footer';
import { NavItem } from '../../interfaces/nav-item';

@Component({
  selector: 'lib-admin-layout',
  imports: [ToastModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  readonly navItems = input<NavItem[]>([]);

  // User profile inputs
  readonly userName = input<string>('Super Admin');
  readonly userInitials = input<string>('SA');
  readonly userRole = input<string>('Super Admin Role');
  readonly userEmail = input<string>('admin@travelplatform.com');
  readonly notificationCount = input<string>('3');
}
