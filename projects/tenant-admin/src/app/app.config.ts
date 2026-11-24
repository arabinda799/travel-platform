import { ApplicationConfig } from '@angular/core';
import { createAdminAppConfig, API_BASE_URL, authInterceptor } from 'admin-core';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = createAdminAppConfig({
  routes,
  interceptors: [authInterceptor],
  additionalProviders: [
    { provide: API_BASE_URL, useValue: environment.apiUrl },
  ],
});
