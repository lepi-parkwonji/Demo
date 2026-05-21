import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
})
export class TermsComponent {
  private api = inject(PublicApiService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  page = signal<{ title: string; content: string } | null>(null);
  error = signal(false);

  constructor() {
    const slug = this.route.snapshot.url[0]?.path ?? 'terms';
    this.api.getSitePage(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.page.set(data),
        error: () => this.error.set(true),
      });
  }
}
