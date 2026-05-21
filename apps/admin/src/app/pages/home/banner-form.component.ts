import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@demo-shop/ui';

type BannerType = 'HERO' | 'INTRO' | 'SPONSOR' | 'WIDE';

const TYPE_LABELS: Record<BannerType, string> = {
  HERO: '히어로 배너',
  INTRO: '전시소개 이미지',
  SPONSOR: '협찬사/파트너',
  WIDE: '가로 배너',
};

@Component({
  selector: 'app-banner-form',
  imports: [FormsModule],
  templateUrl: './banner-form.component.html',
})
export class BannerFormComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly typeLabels = TYPE_LABELS;

  id: number | null = null;
  type: BannerType = 'HERO';
  title = '';
  subtitle = '';
  imageUrl = '';
  videoUrl = '';
  linkUrl = '';
  sortOrder = 0;
  isExposed = true;

  loading = signal(false);
  saving = signal(false);
  uploading = signal<false | 'image' | 'video'>(false);

  get isEdit() { return this.id !== null; }
  get typeLabel() { return TYPE_LABELS[this.type]; }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loading.set(true);
      this.http.get<any>(`/api/banners/${this.id}`).subscribe({
        next: data => {
          this.type = data.type;
          this.title = data.title;
          this.subtitle = data.subtitle;
          this.imageUrl = data.imageUrl;
          this.videoUrl = data.videoUrl ?? '';
          this.linkUrl = data.linkUrl;
          this.sortOrder = data.sortOrder;
          this.isExposed = data.isExposed;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      const stateType = (history.state as { type?: BannerType })?.type;
      if (stateType) this.type = stateType;
    }
  }

  onImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set('image');
    const form = new FormData();
    form.append('file', file);
    this.http.post<{ url: string }>('/api/upload/image', form).subscribe({
      next: ({ url }) => { this.imageUrl = url; this.uploading.set(false); },
      error: () => { this.toast.error('이미지 업로드에 실패했습니다.'); this.uploading.set(false); },
    });
  }

  onVideoSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set('video');
    const form = new FormData();
    form.append('file', file);
    this.http.post<{ url: string }>('/api/upload/video', form).subscribe({
      next: ({ url }) => { this.videoUrl = url; this.uploading.set(false); },
      error: () => { this.toast.error('동영상 업로드에 실패했습니다.'); this.uploading.set(false); },
    });
  }

  onSubmit() {
    this.saving.set(true);
    const body = {
      type: this.type,
      title: this.title,
      subtitle: this.subtitle,
      imageUrl: this.imageUrl,
      videoUrl: this.videoUrl,
      linkUrl: this.linkUrl,
      sortOrder: this.sortOrder,
      isExposed: this.isExposed,
    };
    const req = this.isEdit
      ? this.http.patch(`/api/banners/${this.id}`, body)
      : this.http.post('/api/banners', body);

    req.subscribe({
      next: () => { this.toast.success('저장되었습니다.'); this.saving.set(false); this.navigateBack(); },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  navigateBack() {
    this.router.navigate(['/home/banners']);
  }
}
