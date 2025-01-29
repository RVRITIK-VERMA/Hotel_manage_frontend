import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HotelApiService } from './hotel-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), // Required for ngx-toastr animations
    provideToastr({
      timeOut: 4000, // Duration in milliseconds
      positionClass: 'toast-top-right', // Position of the toast
      preventDuplicates: true, // Avoid duplicate toasts
    }),
    { provide: HotelApiService, useClass: HotelApiService }
  ],
};
