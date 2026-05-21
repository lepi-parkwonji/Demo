import { registerLocaleData } from '@angular/common';
import localeKo from '@angular/common/locales/ko';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeKo);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
