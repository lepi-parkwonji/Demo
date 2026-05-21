import { Component, OnInit, inject, signal } from '@angular/core';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-wide-banner',
  templateUrl: './wide-banner.component.html',
})
export class WideBannerComponent implements OnInit {
  private api = inject(PublicApiService);

  banner = signal<{ imageUrl: string; linkUrl: string } | null>(null);

  ngOnInit() {
    this.api.getBanners('WIDE').subscribe({
      next: data => {
        const first = data[0];
        if (first?.imageUrl) this.banner.set({ imageUrl: first.imageUrl, linkUrl: first.linkUrl });
      },
    });
  }
}
