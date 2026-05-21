import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FaqDTO, PaginatedResult, PublicApiService } from '../../../services/public-api.service';
import { PaginationComponent } from '@demo-shop/ui';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';

@Component({
  selector: 'app-faq-list',
  imports: [PaginationComponent, SearchInputComponent],
  templateUrl: './faq-list.component.html',
})
export class FaqListComponent {
  private api = inject(PublicApiService);
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

  load() {
    this.api.searchFaqs(this.pageNo(), 20, this.query() || undefined)
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
    // FAQ는 상세 페이지 없음 — 선택한 질문으로 검색
    this.onSearch(item.label);
  }

  changePage(page: number) { this.pageNo.set(page); this.load(); }
}
