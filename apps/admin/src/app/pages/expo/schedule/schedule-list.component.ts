import { DecimalPipe, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  ScheduleResponseDto as ScheduleDTO,
  scheduleControllerRemove,
  scheduleControllerSearch,
  scheduleControllerToggleExpose,
  scheduleControllerUpdate,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

type ScheduleStatus = 'PENDING' | 'ONGOING' | 'FINISHED' | 'CANCELLED';

@Component({
  selector: 'app-schedule-list',
  imports: [FormsModule, SlicePipe, DecimalPipe, PaginationComponent, SearchInputComponent],
  templateUrl: './schedule-list.component.html',
})
export class ScheduleListComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<ScheduleDTO> | null>(null);
  pageNo = signal(1);
  query = signal('');
  statusQuery = signal<ScheduleStatus | ''>('');
  yearQuery = signal('');
  regionQuery = signal('');
  selectedItem = signal<ScheduleDTO | null>(null);
  drawerLoading = signal(false);
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(s => ({ id: s.id, label: s.fairName })),
  );

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToNew() {
    this.router.navigate(['/expo/schedule/new']);
  }

  load() {
    const status = this.statusQuery() || undefined;
    const year = this.yearQuery() ? +this.yearQuery() : undefined;
    scheduleControllerSearch(this.http, '', {
      pageNo: this.pageNo(),
      pageSize: 10,
      query: this.query() || undefined,
      status,
      year,
      region: this.regionQuery() || undefined,
    })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  onQueryChange(value: string) {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageNo.set(1); this.load(); }, 400);
  }

  onStatusChange(value: string) { this.statusQuery.set(value as ScheduleStatus | ''); this.pageNo.set(1); this.load(); }
  onYearChange(value: string) { this.yearQuery.set(value); this.pageNo.set(1); this.load(); }
  onRegionChange(value: string) { this.regionQuery.set(value); this.pageNo.set(1); this.load(); }
  onSearch(value: string) { clearTimeout(this.searchTimer); this.query.set(value); this.pageNo.set(1); this.load(); }
  onSelect(item: SearchSuggestion) {
    const found = this.result()?.items.find(s => s.id === item.id);
    if (found) this.navigateToEdit(found);
  }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  navigateToEdit(item: ScheduleDTO) {
    this.router.navigate(['/expo/schedule', item.id, 'edit'], { state: { schedule: item } });
  }

  openDrawer(item: ScheduleDTO) {
    this.selectedItem.set({ ...item });
  }

  closeDrawer() {
    this.selectedItem.set(null);
  }

  saveDrawer() {
    const item = this.selectedItem();
    if (!item) return;
    this.drawerLoading.set(true);
    scheduleControllerUpdate(this.http, '', {
      id: item.id,
      body: {
        status: item.status,
        isExposed: item.isExposed,
        details: item.details,
        notice: item.notice ?? undefined,
        eventNotes: item.eventNotes ?? undefined,
      },
    })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map(i => i.id === updated.id ? updated : i),
          } : null);
          this.toast.success('저장되었습니다.');
          this.closeDrawer();
          this.drawerLoading.set(false);
        },
        error: () => {
          this.toast.error('저장 중 오류가 발생했습니다.');
          this.drawerLoading.set(false);
        },
      });
  }

  toggleExpose(item: ScheduleDTO, event: Event) {
    event.stopPropagation();
    scheduleControllerToggleExpose(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map(i => i.id === item.id ? { ...i, isExposed: updated.isExposed } : i),
          } : null);
          this.toast.success(updated.isExposed ? '공개 처리되었습니다.' : '비공개 처리되었습니다.');
        },
        error: () => this.toast.error('변경 중 오류가 발생했습니다.'),
      });
  }

  remove(item: ScheduleDTO, event: Event) {
    event.stopPropagation();
    if (!confirm(`"${item.fairName}" 박람회를 삭제하시겠습니까?`)) return;
    scheduleControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('삭제되었습니다.');
          if (this.selectedItem()?.id === item.id) this.closeDrawer();
          this.load();
        },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }
}
