import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleryDTO, PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-gallery-detail',
  imports: [SlicePipe],
  templateUrl: './gallery-detail.component.html',
})
export class GalleryDetailComponent {
  private api = inject(PublicApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  gallery = signal<GalleryDTO | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.findOneGallery(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.gallery.set(data),
        error: () => this.router.navigate(['/gallery']),
      });
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }
}
