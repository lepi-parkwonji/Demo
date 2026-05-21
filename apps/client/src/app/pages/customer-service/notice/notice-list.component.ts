import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { NoticeDTO, PaginatedResult, PublicApiService } from '../../../services/public-api.service';
import { PaginationComponent } from '@demo-shop/ui';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';

@Component({
  selector: 'app-notice-list',
  imports: [SlicePipe, RouterLink, PaginationComponent, SearchInputComponent],
  templateUrl: './notice-list.component.html',
})
export class NoticeListComponent {
  private api = inject(PublicApiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

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

  load() {
    this.api.searchNotices(this.pageNo(), 10, this.query() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  onQueryChange(value: string) {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageNo.set(1); this.load(); }, 400);
  }

  onSearch(value: string) {
    clearTimeout(this.searchTimer);
    this.query.set(value);
    this.pageNo.set(1);
    this.load();
  }

  onSelect(item: SearchSuggestion) {
    this.router.navigate(['/customer-service/notice', item.id]);
  }

  changePage(page: number) { this.pageNo.set(page); this.load(); }
}
