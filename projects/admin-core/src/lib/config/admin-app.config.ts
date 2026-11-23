import { ApplicationConfig, EnvironmentProviders, ErrorHandler, Provider, provideBrowserGlobalErrorListeners } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { GlobalErrorHandler } from '../services/error-handler.service';

export interface AdminAppConfigOptions {
  routes: Routes;
  interceptors?: HttpInterceptorFn[];
  additionalProviders?: Array<Provider | EnvironmentProviders>;
}

export function createAdminAppConfig(options: AdminAppConfigOptions): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(options.routes),
      { provide: ErrorHandler, useClass: GlobalErrorHandler },
      provideHttpClient(withInterceptors(options.interceptors ?? [])),
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
