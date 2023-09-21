import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { KlesMaterialDynamicformsModule } from 'kles-material-dynamicforms';
import { MaterialModule } from './modules/material.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { KlesNgPipeModule} from '@3kles/kles-ng-pipe';
import localeFr from '@angular/common/locales/fr';
import { CommonModule, registerLocaleData } from '@angular/common';
import { SelectTriggerComponent } from './select/select-trigger.component';
import { SelectOptionComponent } from './select/select-option.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { KlesMomentDateModule } from '@3kles/kles-material-datepicker';
registerLocaleData(localeFr);
@NgModule({
  declarations: [
    AppComponent,
    SelectTriggerComponent,
    SelectOptionComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    KlesNgPipeModule,
    KlesMaterialDynamicformsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatMomentDateModule,
    KlesMomentDateModule,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: (HttpLoaderFactory),
          deps: [HttpClient]
        }
      }
    )
  ],
  exports: [KlesMaterialDynamicformsModule],
  providers: [TranslateService, { provide: LOCALE_ID, useValue: 'fr-FR' }],
  bootstrap: [AppComponent]
})
export class AppModule {

}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}