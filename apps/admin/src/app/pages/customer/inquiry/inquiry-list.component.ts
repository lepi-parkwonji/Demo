import { NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  InquiryResponseDto as InquiryDTO,
  inquiryControllerRemove,
  inquiryControllerSearch,
  inquiryControllerToggleExpose,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-inquiry-list',
  imports: [SlicePipe, NgClass, PaginationComponent, SearchInputComponent],
  templateUrl: './inquiry-list.component.html',
})
export class InquiryListComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<InquiryDTO> | null>(null);
  pageNo = signal(1);
  query = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(i => ({ id: i.id, label: i.title })),
  );

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToAnswer(item: InquiryDTO) {
    this.router.navigate(['/customer/inquiry', item.id, 'answer'], { state: { inquiry: item } });
  }

  load() {
    inquiryControllerSearch(this.http, '', { pageNo: this.pageNo(), pageSize: 10, query: this.query() || undefined })
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
    const found = this.result()?.items.find(i => i.id === item.id);
    if (found) this.navigateToAnswer(found);
  }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  toggleExpose(item: InquiryDTO) {
    inquiryControllerToggleExpose(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map((existing: InquiryDTO) => existing.id === item.id ? { ...existing, isExposed: updated.isExposed } : existing),
          } : null);
          this.toast.success(updated.isExposed ? '문의가 노출됩니다.' : '문의가 숨김 처리되었습니다.');
        },
        error: () => this.toast.error('변경 중 오류가 발생했습니다.'),
      });
  }

  remove(item: InquiryDTO) {
    if (!confirm(`"${item.title}" 문의를 삭제하시겠습니까?`)) return;
    inquiryControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('문의가 삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }
}
