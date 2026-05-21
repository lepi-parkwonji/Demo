import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth/callback/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/default/default-layout.component').then(m => m.DefaultLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        pathMatch: 'full',
      },
      {
        path: 'introduction',
        loadComponent: () => import('./pages/introduction/introduction.component').then(m => m.IntroductionComponent),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./pages/gallery/gallery-list.component').then(m => m.GalleryListComponent),
      },
      {
        path: 'terms',
        loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent),
      },
      {
        path: 'privacy',
        loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent),
      },
      {
        path: 'marketing-consent',
        loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent),
      },
      {
        path: 'visitor-guide',
        loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent),
      },
      {
        path: 'pre-registration',
        loadComponent: () => import('./pages/pre-registration/pre-registration.component').then(m => m.PreRegistrationComponent),
        children: [
          { path: '', redirectTo: 'form', pathMatch: 'full' },
          {
            path: 'form',
            loadComponent: () => import('./pages/pre-registration/registration-form.component').then(m => m.RegistrationFormComponent),
          },
          {
            path: 'lookup',
            loadComponent: () => import('./pages/pre-registration/registration-lookup.component').then(m => m.RegistrationLookupComponent),
          },
        ],
      },
      {
        path: 'customer-service',
        loadComponent: () => import('./pages/customer-service/customer-service.component').then(m => m.CustomerServiceComponent),
        children: [
          { path: '', redirectTo: 'notice', pathMatch: 'full' },
          {
            path: 'notice',
            loadComponent: () => import('./pages/customer-service/notice/notice-list.component').then(m => m.NoticeListComponent),
          },
          {
            path: 'notice/:id',
            loadComponent: () => import('./pages/customer-service/notice/notice-detail.component').then(m => m.NoticeDetailComponent),
          },
          {
            path: 'faq',
            loadComponent: () => import('./pages/customer-service/faq/faq-list.component').then(m => m.FaqListComponent),
          },
          {
            path: 'inquiry',
            loadComponent: () => import('./pages/customer-service/inquiry/inquiry-list.component').then(m => m.InquiryListComponent),
          },
          {
            path: 'inquiry/new',
            loadComponent: () => import('./pages/customer-service/inquiry/inquiry-form.component').then(m => m.InquiryFormComponent),
          },
          {
            path: 'inquiry/:id',
            loadComponent: () => import('./pages/customer-service/inquiry/inquiry-detail.component').then(m => m.InquiryDetailComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
