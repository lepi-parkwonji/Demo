import { NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  NoticeResponseDto as NoticeDTO,
  noticeControllerRemove,
  noticeControllerSearch,
  noticeControllerToggleExpose,
  noticeControllerTogglePin,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-notice-list',
  imports: [SlicePipe, NgClass, PaginationComponent, SearchInputComponent],
  templateUrl: './notice-list.component.html',
})
export class NoticeListComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<NoticeDTO> | null>(null);
  pageNo = signal(1);
  query = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(n => ({ id: n.id, label: n.title })),
  );

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToNew() {
    this.router.navigate(['/customer/notice/new']);
  }

  navigateToEdit(item: NoticeDTO) {
    this.router.navigate(['/customer/notice', item.id, 'edit'], { state: { notice: item } });
  }

  load() {
    noticeControllerSearch(this.http, '', { pageNo: this.pageNo(), pageSize: 10, query: this.query() || undefined })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  onQueryChange(value: string) {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageNo.set(1); this.load(); }, 400);
  }

  onSearch(value: string) { clearTimeout(this.searchTimer); this.query.set(value); this.pageNo.set(1); this.load(); }
  onSelect(item: SearchSuggestion) {
    const found = this.result()?.items.find(n => n.id === item.id);
    if (found) this.navigateToEdit(found);
  }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  togglePin(item: NoticeDTO) {
    noticeControllerTogglePin(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map(existingItem => existingItem.id === item.id ? { ...existingItem, isPinned: updated.isPinned } : existingItem),
          } : null);
          this.toast.success(updated.isPinned ? '공지사항이 고정되었습니다.' : '고정이 해제되었습니다.');
        },
        error: () => this.toast.error('변경 중 오류가 발생했습니다.'),
      });
  }

  toggleExpose(item: NoticeDTO) {
    noticeControllerToggleExpose(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map(existingItem => existingItem.id === item.id ? { ...existingItem, isExposed: updated.isExposed } : existingItem),
          } : null);
          this.toast.success(updated.isExposed ? '공지사항이 노출됩니다.' : '공지사항이 숨김 처리되었습니다.');
        },
        error: () => this.toast.error('변경 중 오류가 발생했습니다.'),
      });
  }

  remove(item: NoticeDTO) {
    if (!confirm(`"${item.title}" 공지사항을 삭제하시겠습니까?`)) return;
    noticeControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('공지사항이 삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }
}
