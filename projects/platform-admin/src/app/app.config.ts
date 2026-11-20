import { ApplicationConfig } from '@angular/core';
import { createAdminAppConfig } from 'admin-core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = createAdminAppConfig({ routes });
