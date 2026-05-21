import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@demo-shop/ui';

type BannerType = 'HERO' | 'INTRO' | 'SPONSOR' | 'WIDE';

interface Banner {
  id: number;
  type: BannerType;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  sortOrder: number;
  isExposed: boolean;
}

const TYPE_LABELS: Record<BannerType, string> = {
  HERO: '히어로 배너',
  INTRO: '전시소개 이미지',
  SPONSOR: '협찬사/파트너',
  WIDE: '가로 배너',
};

@Component({
  selector: 'app-banner-list',
  templateUrl: './banner-list.component.html',
})
export class BannerListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly tabs: BannerType[] = ['HERO', 'INTRO', 'WIDE', 'SPONSOR'];
  readonly typeLabels = TYPE_LABELS;

  activeTab = signal<BannerType>('HERO');
  banners = signal<Banner[]>([]);
  loading = signal(false);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<Banner[]>('/api/banners', { params: { type: this.activeTab() } }).subscribe({
      next: data => { this.banners.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  selectTab(tab: BannerType) {
    this.activeTab.set(tab);
    this.load();
  }

  navigateToNew() {
    this.router.navigate(['/home/banners/new'], { state: { type: this.activeTab() } });
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/home/banners', id, 'edit']);
  }

  toggleExpose(id: number) {
    this.http.patch(`/api/banners/${id}/toggle-expose`, {}).subscribe({
      next: () => this.load(),
      error: () => this.toast.error('처리에 실패했습니다.'),
    });
  }

  remove(id: number) {
    if (!confirm('삭제하시겠습니까?')) return;
    this.http.delete(`/api/banners/${id}`).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.load(); },
      error: () => this.toast.error('삭제에 실패했습니다.'),
    });
  }
}
