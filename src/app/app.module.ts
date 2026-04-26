import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AccessTokenInterceptor } from './auth/interceptors/accessToken.interceptor';
import { registerLocaleData } from '@angular/common';
import { StarRatingModule } from 'angular-star-rating';

import localeMX from '@angular/common/locales/es-MX';
registerLocaleData(localeMX, 'es-MX');


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    StarRatingModule.forRoot(),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS,
      useClass: AccessTokenInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'es-MX' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
