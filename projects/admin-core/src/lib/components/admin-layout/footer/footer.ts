import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly companyName = input<string>('EasyFlys');
  readonly appVersion = input<string>('v1.0.0');
  readonly systemStatus = input<string>('Systems Operational');
}
