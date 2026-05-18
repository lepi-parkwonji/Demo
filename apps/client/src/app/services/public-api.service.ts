import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FaqResponseDto as FaqDTO, NoticeResponseDto as NoticeDTO, GalleryResponseDto as GalleryDTO, ScheduleResponseDto as ScheduleDTO, RegistrationResponseDto as RegistrationDTO } from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';

export type { NoticeDTO, FaqDTO, GalleryDTO, ScheduleDTO, RegistrationDTO, PaginatedResult };

export interface SiteSettingsDto {
  businessName: string;
  businessNo: string;
  ceoName: string;
  address: string;
  phone: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private http = inject(HttpClient);

  searchNotices(pageNo = 1, pageSize = 10, query?: string) {
    let params = new HttpParams().set('pageNo', pageNo).set('pageSize', pageSize);
    if (query) params = params.set('query', query);
    return this.http.get<PaginatedResult<NoticeDTO>>('/api/public/notices', { params });
  }

  findOneNotice(id: number) {
    return this.http.get<NoticeDTO>(`/api/public/notices/${id}`);
  }

  searchFaqs(pageNo = 1, pageSize = 20, query?: string) {
    let params = new HttpParams().set('pageNo', pageNo).set('pageSize', pageSize);
    if (query) params = params.set('query', query);
    return this.http.get<PaginatedResult<FaqDTO>>('/api/public/faqs', { params });
  }

  searchGalleries(pageNo = 1, pageSize = 9, category = 'GALLERY', eventName?: string) {
    let params = new HttpParams()
      .set('pageNo', pageNo)
      .set('pageSize', pageSize)
      .set('category', category);
    if (eventName) params = params.set('eventName', eventName);
    return this.http.get<PaginatedResult<GalleryDTO>>('/api/public/galleries', { params });
  }

  findOneGallery(id: number) {
    return this.http.get<GalleryDTO>(`/api/public/galleries/${id}`);
  }

  getPublicSchedules() {
    return this.http.get<ScheduleDTO[]>('/api/public/schedules');
  }

  createRegistration(body: { name: string; contact: string; fairName: string; marketingConsent: boolean }) {
    return this.http.post<RegistrationDTO>('/api/public/registrations', body);
  }

  findRegistrationByNo(reservationNo: string) {
    return this.http.get<RegistrationDTO>(`/api/public/registrations/${reservationNo}`);
  }

  updateRegistrationByNo(reservationNo: string, body: { name?: string; contact?: string }) {
    return this.http.patch<RegistrationDTO>(`/api/public/registrations/${reservationNo}`, body);
  }

  getSiteSettings() {
    return this.http.get<SiteSettingsDto>('/api/public/site-settings');
  }

  getSitePage(slug: string) {
    return this.http.get<{ slug: string; title: string; content: string }>(`/api/public/site-pages/${slug}`);
  }

  getBanners(type: 'HERO' | 'INTRO' | 'SPONSOR' | 'WIDE') {
    return this.http.get<{ id: number; type: string; title: string; subtitle: string; imageUrl: string; videoUrl: string; linkUrl: string; sortOrder: number }[]>(
      '/api/public/banners', { params: { type } }
    );
  }
}
