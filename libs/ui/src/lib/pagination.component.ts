import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [NgClass],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  pageNo = input.required<number>();
  totalPages = input.required<number>();
  totalItems = input.required<number>();
  pageChange = output<number>();

  pages = computed((): (number | null)[] => {
    const total = this.totalPages();
    const current = this.pageNo();

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const result: (number | null)[] = [1];

    const rangeStart = Math.max(2, current - 2);
    const rangeEnd = Math.min(total - 1, current + 2);

    if (rangeStart > 2) result.push(null);
    for (let page = rangeStart; page <= rangeEnd; page++) result.push(page);
    if (rangeEnd < total - 1) result.push(null);

    result.push(total);
    return result;
  });

  go(page: number) {
    if (page === this.pageNo()) return;
    this.pageChange.emit(page);
  }
}
