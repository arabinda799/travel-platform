import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'lib-thumb-image',
  standalone: true,
  imports: [],
  templateUrl: './thumb-image.html',
  styleUrl: './thumb-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbImageComponent {
  readonly src = input<string | null | undefined>(null);
  readonly alt = input<string>('');
  readonly fallbackIcon = input<string>('image_not_supported');

  readonly state = signal<'loading' | 'loaded' | 'error'>('loading');

  constructor() {
    effect(() => {
      const s = this.src();
      this.state.set(s ? 'loading' : 'error');
    });
  }

  onLoad(): void { this.state.set('loaded'); }
  onError(): void { this.state.set('error'); }
}
