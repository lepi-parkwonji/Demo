import { NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  GalleryResponseDto as GalleryDTO,
  ScheduleResponseDto as ScheduleDTO,
  galleryControllerRemove,
  galleryControllerSearch,
  galleryControllerToggleExpose,
  scheduleControllerSearch,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-gallery-list',
  imports: [NgClass, SlicePipe, FormsModule, PaginationComponent],
  templateUrl: './gallery-list.component.html',
})
export class GalleryListComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<GalleryDTO> | null>(null);
  schedules = signal<ScheduleDTO[]>([]);
  pageNo = signal(1);
  eventNameFilter = signal('');

  constructor() {
    scheduleControllerSearch(this.http, '', { pageNo: 1, pageSize: 100 })
      .pipe(map(r => r.body.items), takeUntilDestroyed(this.destroyRef))
      .subscribe(items => this.schedules.set(items));
    this.load();
  }

  navigateToNew() {
    this.router.navigate(['/expo/gallery/new']);
  }

  navigateToEdit(item: GalleryDTO) {
    this.router.navigate(['/expo/gallery', item.id, 'edit'], { state: { gallery: item } });
  }

  load() {
    galleryControllerSearch(this.http, '', {
      pageNo: this.pageNo(),
      pageSize: 6,
      category: 'GALLERY',
      eventName: this.eventNameFilter() || undefined,
    })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  onEventNameFilterChange() { this.pageNo.set(1); this.load(); }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  remove(item: GalleryDTO, event: Event) {
    event.stopPropagation();
    if (!confirm(`"${item.title}" 갤러리를 삭제하시겠습니까?`)) return;
    galleryControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('갤러리가 삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }

  toggleExpose(item: GalleryDTO, event: Event) {
    event.stopPropagation();
    galleryControllerToggleExpose(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          const result = this.result();
          if (result) {
            this.result.set({ ...result, items: result.items.map(i => i.id === updated!.id ? updated! : i) });
          }
        },
        error: () => this.toast.error('처리 중 오류가 발생했습니다.'),
      });
  }
}
