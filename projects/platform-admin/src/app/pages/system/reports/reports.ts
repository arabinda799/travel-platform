import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  PageContainerComponent,
  ButtonComponent,
  BreadcrumbItem,
} from 'admin-core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [PageContainerComponent, ButtonComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'System' },
    { label: 'Reports' },
  ];

  constructor(private readonly router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/']);
  }
}
