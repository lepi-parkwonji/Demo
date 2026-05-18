import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicApiService, SiteSettingsDto } from '../../services/public-api.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  private api = inject(PublicApiService);

  site = signal<SiteSettingsDto | null>(null);

  ngOnInit() {
    this.api.getSiteSettings().subscribe({ next: data => this.site.set(data), error: () => {} });
  }
}
