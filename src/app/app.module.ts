import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { KlesMaterialDynamicformsModule } from 'kles-material-dynamicforms';
import { MaterialModule } from './modules/material.module';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideTranslateService, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { KlesNgPipeModule} from '@3kles/kles-ng-pipe';
import localeFr from '@angular/common/locales/fr';
import { CommonModule, registerLocaleData } from '@angular/common';
import { SelectTriggerComponent } from './select/select-trigger.component';
import { SelectOptionComponent } from './select/select-option.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

registerLocaleData(localeFr);
@NgModule({ declarations: [
        AppComponent,
        SelectTriggerComponent,
        SelectOptionComponent
    ],
    exports: [KlesMaterialDynamicformsModule],
    bootstrap: [AppComponent], imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        MaterialModule,
        KlesNgPipeModule,
        KlesMaterialDynamicformsModule,
        BrowserAnimationsModule,
        MatMomentDateModule,
        // TranslateModule.forRoot({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: (HttpLoaderFactory),
        //         deps: [HttpClient]
        //     }
        // })
    ], 
        providers: [TranslateService, { provide: LOCALE_ID, useValue: 'fr-FR' }, provideHttpClient(withInterceptorsFromDi()),
            provideTranslateService({
                loader: provideTranslateHttpLoader({
                    prefix: '/assets/i18n/',
                    suffix: '.json'
                }),
                fallbackLang: 'fr',
                lang: 'fr'
                })
        ] })
export class AppModule {

}

