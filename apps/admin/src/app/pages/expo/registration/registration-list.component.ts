import { SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchInputComponent, SearchSuggestion } from '@demo-shop/ui';
import {
  RegistrationResponseDto as RegistrationDTO,
  registrationControllerRemove,
  registrationControllerSearch,
} from '@demo-shop/api-client';
import { PaginatedResult } from '@demo-shop/common';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-registration-list',
  imports: [FormsModule, SlicePipe, PaginationComponent, SearchInputComponent],
  templateUrl: './registration-list.component.html',
})
export class RegistrationListComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<RegistrationDTO> | null>(null);
  pageNo = signal(1);
  query = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  suggestions = computed<SearchSuggestion[]>(() =>
    (this.result()?.items ?? []).slice(0, 5).map(r => ({ id: r.id, label: r.name })),
  );

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  navigateToNew() {
    this.router.navigate(['/expo/registration/new']);
  }

  openDetail(item: RegistrationDTO) {
    this.router.navigate(['/expo/registration', item.id, 'edit']);
  }

  load() {
    registrationControllerSearch(this.http, '', {
      pageNo: this.pageNo(),
      pageSize: 10,
      query: this.query() || undefined,
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

  onSelect(item: SearchSuggestion) {
    const found = this.result()?.items.find(r => r.id === item.id);
    if (found) this.openDetail(found);
  }

  changePage(page: number) { this.pageNo.set(page); this.load(); }

  rowNumber(index: number): number {
    const result = this.result();
    if (!result) return 0;
    const { totalItems, pageSize } = result.pageInfo;
    return totalItems - ((this.pageNo() - 1) * pageSize + index);
  }

  remove(item: RegistrationDTO, event: Event) {
    event.stopPropagation();
    if (!confirm(`"${item.name}"의 사전등록 내역을 삭제하시겠습니까?`)) return;
    registrationControllerRemove(this.http, '', { id: item.id })
      .pipe(map(r => r.body), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toast.success('삭제되었습니다.'); this.load(); },
        error: () => this.toast.error('삭제 중 오류가 발생했습니다.'),
      });
  }
}
