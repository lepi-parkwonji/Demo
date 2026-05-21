import { NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  FaqResponseDto as FaqDTO,
  faqControllerRemove,
  faqControllerSearch,
  faqControllerToggleExpose,
  faqControllerTogglePin,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-faq-list',
  imports: [SlicePipe, NgClass, PaginationComponent, SearchInputComponent],
  templateUrl: './faq-list.component.html',
})
export class FaqListComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<FaqDTO> | null>(null);
  pageNo = signal(1);
  query = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(f => ({ id: f.id, label: f.question })),
  );

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToNew() {
    this.router.navigate(['/customer/faq/new']);
  }

  navigateToEdit(item: FaqDTO) {
    this.router.navigate(['/customer/faq', item.id, 'edit'], { state: { faq: item } });
  }

  load() {
    faqControllerSearch(this.http, '', { pageNo: this.pageNo(), pageSize: 10, query: this.query() || undefined })
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
    const found = this.result()?.items.find(f => f.id === item.id);
    if (found) this.navigateToEdit(found);
  }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  togglePin(item: FaqDTO) {
    faqControllerTogglePin(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map(existingItem => existingItem.id === item.id ? { ...existingItem, isPinned: updated.isPinned } : existingItem),
          } : null);
          this.toast.success(updated.isPinned ? 'FAQ가 고정되었습니다.' : '고정이 해제되었습니다.');
        },
        error: () => this.toast.error('변경 중 오류가 발생했습니다.'),
      });
  }

  toggleExpose(item: FaqDTO) {
    faqControllerToggleExpose(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.result.update(current => current ? {
            ...current,
            items: current.items.map(existingItem => existingItem.id === item.id ? { ...existingItem, isExposed: updated.isExposed } : existingItem),
          } : null);
          this.toast.success(updated.isExposed ? 'FAQ가 노출됩니다.' : 'FAQ가 숨김 처리되었습니다.');
        },
        error: () => this.toast.error('변경 중 오류가 발생했습니다.'),
      });
  }

  remove(item: FaqDTO) {
    if (!confirm(`"${item.question}" FAQ를 삭제하시겠습니까?`)) return;
    faqControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('FAQ가 삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }
}
