import { Route } from '@angular/router';
import { authGuard, authGuardChild } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/auth/sign-in/sign-in.component').then(m => m.SignInComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/default/default-layout.component').then(m => m.DefaultLayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'home/banners',
        loadComponent: () => import('./pages/home/banner-list.component').then(m => m.BannerListComponent),
      },
      {
        path: 'home/banners/new',
        loadComponent: () => import('./pages/home/banner-form.component').then(m => m.BannerFormComponent),
      },
      {
        path: 'home/banners/:id/edit',
        loadComponent: () => import('./pages/home/banner-form.component').then(m => m.BannerFormComponent),
      },
      {
        path: 'dashboard',
        data: { title: '대시보드' },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'customer/notice',
        loadComponent: () => import('./pages/customer/notice/notice-list.component').then(m => m.NoticeListComponent),
      },
      {
        path: 'customer/notice/new',
        loadComponent: () => import('./pages/customer/notice/notice-form.component').then(m => m.NoticeFormComponent),
      },
      {
        path: 'customer/notice/:id/edit',
        loadComponent: () => import('./pages/customer/notice/notice-form.component').then(m => m.NoticeFormComponent),
      },
      {
        path: 'customer/faq',
        loadComponent: () => import('./pages/customer/faq/faq-list.component').then(m => m.FaqListComponent),
      },
      {
        path: 'customer/faq/new',
        loadComponent: () => import('./pages/customer/faq/faq-form.component').then(m => m.FaqFormComponent),
      },
      {
        path: 'customer/faq/:id/edit',
        loadComponent: () => import('./pages/customer/faq/faq-form.component').then(m => m.FaqFormComponent),
      },
      {
        path: 'customer/inquiry',
        loadComponent: () => import('./pages/customer/inquiry/inquiry-list.component').then(m => m.InquiryListComponent),
      },
      {
        path: 'customer/inquiry/:id/answer',
        loadComponent: () => import('./pages/customer/inquiry/inquiry-answer.component').then(m => m.InquiryAnswerComponent),
      },
      {
        path: 'expo/schedule',
        loadComponent: () => import('./pages/expo/schedule/schedule-list.component').then(m => m.ScheduleListComponent),
      },
      {
        path: 'expo/schedule/new',
        loadComponent: () => import('./pages/expo/schedule/schedule-form.component').then(m => m.ScheduleFormComponent),
      },
      {
        path: 'expo/schedule/:id/edit',
        loadComponent: () => import('./pages/expo/schedule/schedule-form.component').then(m => m.ScheduleFormComponent),
      },
      {
        path: 'expo/exhibitor',
        loadComponent: () => import('./pages/expo/exhibitor/exhibitor-list.component').then(m => m.ExhibitorListComponent),
      },
      {
        path: 'expo/exhibitor/:id',
        loadComponent: () => import('./pages/expo/exhibitor/exhibitor-detail.component').then(m => m.ExhibitorDetailComponent),
      },
      {
        path: 'expo/registration',
        loadComponent: () => import('./pages/expo/registration/registration-list.component').then(m => m.RegistrationListComponent),
      },
      {
        path: 'expo/registration/new',
        loadComponent: () => import('./pages/expo/registration/registration-form.component').then(m => m.RegistrationFormComponent),
      },
      {
        path: 'expo/registration/:id/edit',
        loadComponent: () => import('./pages/expo/registration/registration-form.component').then(m => m.RegistrationFormComponent),
      },

      {
        path: 'expo/gallery',
        loadComponent: () => import('./pages/expo/gallery/gallery-list.component').then(m => m.GalleryListComponent),
      },
      {
        path: 'expo/gallery/new',
        loadComponent: () => import('./pages/expo/gallery/gallery-form.component').then(m => m.GalleryFormComponent),
      },
      {
        path: 'expo/gallery/:id/edit',
        loadComponent: () => import('./pages/expo/gallery/gallery-form.component').then(m => m.GalleryFormComponent),
      },
      {
        path: 'expo/press',
        loadComponent: () => import('./pages/expo/press/press-list.component').then(m => m.PressListComponent),
      },
      {
        path: 'expo/press/new',
        loadComponent: () => import('./pages/expo/press/press-form.component').then(m => m.PressFormComponent),
      },
      {
        path: 'expo/press/:id/edit',
        loadComponent: () => import('./pages/expo/press/press-form.component').then(m => m.PressFormComponent),
      },
      {
        path: 'site/business',
        loadComponent: () => import('./pages/site/business/site-business.component').then(m => m.SiteBusinessComponent),
      },
      {
        path: 'site/terms',
        loadComponent: () => import('./pages/site/terms/site-terms-list.component').then(m => m.SiteTermsListComponent),
      },
      {
        path: 'site/terms/:slug/edit',
        loadComponent: () => import('./pages/site/terms/site-term-form.component').then(m => m.SiteTermFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
