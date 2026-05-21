import { DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  ExhibitorResponseDto as ExhibitorDTO,
  exhibitorControllerRemove,
  exhibitorControllerSearch,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

type ExhibitorStatus = 'PENDING' | 'WAITING_PAYMENT' | 'APPROVED' | 'CANCELED';

@Component({
  selector: 'app-exhibitor-list',
  imports: [FormsModule, SlicePipe, DecimalPipe, NgClass, PaginationComponent, SearchInputComponent],
  templateUrl: './exhibitor-list.component.html',
})
export class ExhibitorListComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<ExhibitorDTO> | null>(null);
  pageNo = signal(1);
  query = signal('');
  statusQuery = signal<ExhibitorStatus | ''>('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(e => ({ id: e.id, label: e.companyName })),
  );

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToNew() {
    this.router.navigate(['/expo/exhibitor/new']);
  }

  openDetail(item: ExhibitorDTO) {
    this.router.navigate(['/expo/exhibitor', item.id]);
  }

  load() {
    exhibitorControllerSearch(this.http, '', {
      pageNo: this.pageNo(),
      pageSize: 10,
      query: this.query() || undefined,
      status: this.statusQuery() || undefined,
    })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  onQueryChange(value: string) {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageNo.set(1); this.load(); }, 400);
  }

  onStatusChange(value: string) { this.statusQuery.set(value as ExhibitorStatus | ''); this.pageNo.set(1); this.load(); }
  onSearch(value: string) { clearTimeout(this.searchTimer); this.query.set(value); this.pageNo.set(1); this.load(); }
  onSelect(item: SearchSuggestion) {
    const found = this.result()?.items.find(e => e.id === item.id);
    if (found) this.openDetail(found);
  }
  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  remove(item: ExhibitorDTO, event: Event) {
    event.stopPropagation();
    if (!confirm(`"${item.companyName}" 업체의 신청 내역을 삭제하시겠습니까?`)) return;
    exhibitorControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }
}
