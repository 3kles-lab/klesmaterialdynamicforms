import { BrowserModule } from '@angular/platform-browser';
import { ApplicationConfig, LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { KlesDynamicFormIntl, KlesMaterialDynamicformsModule } from 'kles-material-dynamicforms';
import { MaterialModule } from './modules/material.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { KlesNgPipeModule } from '@3kles/kles-ng-pipe';
import localeFr from '@angular/common/locales/fr';
import { CommonModule, registerLocaleData } from '@angular/common';
import { SelectTriggerComponent } from './select/select-trigger.component';
import { SelectOptionComponent } from './select/select-option.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ColorPickerComponent } from 'ngx-color-picker';
import { TranslatedKlesLabelIntl } from './app-intl';

// registerLocaleData(localeFr);
// @NgModule({
//     exports: [KlesMaterialDynamicformsModule],
//     bootstrap: [AppComponent],
//     imports: [
//         CommonModule,
//         BrowserModule,
//         AppRoutingModule,
//         MaterialModule,
//         KlesNgPipeModule,
//         KlesMaterialDynamicformsModule,
//         BrowserAnimationsModule,
//         MatMomentDateModule,
//         ColorPickerComponent,

//         AppComponent,
//         SelectTriggerComponent,
//         SelectOptionComponent

//         // TranslateModule.forRoot({
//         //     loader: {
//         //         provide: TranslateLoader,
//         //         useFactory: (HttpLoaderFactory),
//         //         deps: [HttpClient]
//         //     }
//         // })
//     ],
//     providers: [
//         TranslateService,
//         { provide: LOCALE_ID, useValue: 'fr-FR' },
//         provideHttpClient(withInterceptorsFromDi()),
//         provideTranslateService({
//             fallbackLang: 'en',
//             lang: 'en',
//         }),
//     ],
// })
// export class AppModule {}

registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        provideTranslateService({
            fallbackLang: 'en',
            lang: 'en',
        }),
        {
            provide: KlesDynamicFormIntl,
            useClass: TranslatedKlesLabelIntl,
        },
    ],
};
