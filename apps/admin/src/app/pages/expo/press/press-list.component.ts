import { NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  GalleryResponseDto as GalleryDTO,
  ScheduleResponseDto as ScheduleDTO,
  galleryControllerRemove,
  galleryControllerSearch,
  galleryControllerToggleExpose,
  galleryControllerTogglePin,
  scheduleControllerSearch,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-press-list',
  imports: [NgClass, SlicePipe, FormsModule, PaginationComponent, SearchInputComponent],
  templateUrl: './press-list.component.html',
})
export class PressListComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<GalleryDTO> | null>(null);
  schedules = signal<ScheduleDTO[]>([]);
  pageNo = signal(1);
  query = signal('');
  eventNameFilter = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(g => ({ id: g.id, label: g.title })),
  );

  constructor() {
    scheduleControllerSearch(this.http, '', { pageNo: 1, pageSize: 100 })
      .pipe(map(r => r.body.items), takeUntilDestroyed(this.destroyRef))
      .subscribe(items => this.schedules.set(items));
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToNew() {
    this.router.navigate(['/expo/press/new']);
  }

  navigateToEdit(item: GalleryDTO) {
    this.router.navigate(['/expo/press', item.id, 'edit'], { state: { gallery: item } });
  }

  load() {
    galleryControllerSearch(this.http, '', {
      pageNo: this.pageNo(),
      pageSize: 10,
      query: this.query() || undefined,
      category: 'PRESS',
      eventName: this.eventNameFilter() || undefined,
    })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  onQueryChange(value: string) {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageNo.set(1); this.load(); }, 400);
  }

  onSearch(value: string) { clearTimeout(this.searchTimer); this.query.set(value); this.pageNo.set(1); this.load(); }
  onEventNameFilterChange() { this.pageNo.set(1); this.load(); }
  onSelect(item: SearchSuggestion) {
    const found = this.result()?.items.find(g => g.id === item.id);
    if (found) this.navigateToEdit(found);
  }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  remove(item: GalleryDTO) {
    if (!confirm(`"${item.title}" 보도자료를 삭제하시겠습니까?`)) return;
    galleryControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('보도자료가 삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }

  togglePin(item: GalleryDTO) {
    galleryControllerTogglePin(this.http, '', { id: item.id })
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

  toggleExpose(item: GalleryDTO) {
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
