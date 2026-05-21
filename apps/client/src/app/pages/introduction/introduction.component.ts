import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicApiService, ScheduleDTO } from '../../services/public-api.service';

@Component({
  selector: 'app-introduction',
  imports: [RouterLink, DecimalPipe, DatePipe, NgClass],
  templateUrl: './introduction.component.html',
})
export class IntroductionComponent implements OnInit {
  private api = inject(PublicApiService);

  schedule = signal<ScheduleDTO | null>(null);
  introImage = signal<string>('');
  loading = signal(true);

  readonly occupations = [
    { label: '의료기기 무역/판매업', percent: 19.5 },
    { label: '학계, 연구기관', percent: 15.5 },
    { label: '의료기기 제조', percent: 14.9 },
    { label: '병원장, 의사', percent: 12.7 },
    { label: '간호사', percent: 11.2 },
    { label: '병원 관리자', percent: 9.3 },
    { label: '공공/정보기관', percent: 7.8 },
    { label: '기타', percent: 9.1 },
  ];

  readonly interests = [
    '모바일 헬스(개인 건강 관리)', '의료 소프트웨어', '의료정보시스템',
    '헬스케어 분석', '의료로봇', '원격 진료',
    '의료용품, 응급장비, 소모품', '영상의학 및 진단기기',
    '바이오, 제약 관련 기기', '재활, 물리치료 기기',
    '병원건축 및 인테리어', '교육, 법률 컨설팅',
  ];

  ngOnInit() {
    this.api.getPublicSchedules().subscribe({
      next: data => { this.schedule.set(data[0] ?? null); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.api.getBanners('INTRO').subscribe({
      next: data => this.introImage.set(data[0]?.imageUrl ?? ''),
    });
  }

  tagClass(i: number) {
    if (i < 3) return 'bg-cyan-800 text-white';
    if (i < 6) return 'bg-cyan-500 text-white';
    return 'bg-gray-200 text-gray-700';
  }
}
