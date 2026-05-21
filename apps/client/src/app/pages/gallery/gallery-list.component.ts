import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GalleryDTO, PaginatedResult, PublicApiService } from '../../services/public-api.service';
import { PaginationComponent } from '@demo-shop/ui';

@Component({
  selector: 'app-gallery-list',
  imports: [SlicePipe, PaginationComponent],
  templateUrl: './gallery-list.component.html',
})
export class GalleryListComponent {
  private api = inject(PublicApiService);
  private destroyRef = inject(DestroyRef);

  result = signal<PaginatedResult<GalleryDTO> | null>(null);
  selectedGallery = signal<GalleryDTO | null>(null);
  pageNo = signal(1);

  constructor() {
    this.load();
  }

  load() {
    this.api.searchGalleries(this.pageNo(), 9)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.result.set(response));
  }

  openModal(item: GalleryDTO) { this.selectedGallery.set(item); }
  closeModal() { this.selectedGallery.set(null); }
  changePage(page: number) { this.pageNo.set(page); this.load(); }
}
