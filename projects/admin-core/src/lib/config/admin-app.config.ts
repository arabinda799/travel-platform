import { ApplicationConfig, EnvironmentProviders, ErrorHandler, Provider, provideBrowserGlobalErrorListeners } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { GlobalErrorHandler } from '../services/error-handler.service';

export interface AdminAppConfigOptions {
  routes: Routes;
  additionalProviders?: Array<Provider | EnvironmentProviders>;
}

export function createAdminAppConfig(options: AdminAppConfigOptions): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(options.routes),
      { provide: ErrorHandler, useClass: GlobalErrorHandler },
      provideHttpClient(withInterceptors([])),
      provideAnimationsAsync(),
      MessageService,
      providePrimeNG({
        theme: {
          preset: Aura,
          options: {
            darkModeSelector: '[data-theme="dark"]',
          },
        },
      }),
      ...(options.additionalProviders ?? []),
    ],
  };
}
