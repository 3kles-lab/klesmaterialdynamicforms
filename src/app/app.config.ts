import { ApplicationConfig, LOCALE_ID } from '@angular/core';

import { KlesDynamicFormIntl } from 'kles-material-dynamicforms';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

import { TranslatedKlesLabelIntl } from './app-intl';


registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
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
