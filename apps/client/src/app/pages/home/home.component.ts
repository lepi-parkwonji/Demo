import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicApiService, ScheduleDTO } from '../../services/public-api.service';

interface HeroBanner { imageUrl: string; videoUrl: string; title: string; subtitle: string; linkUrl: string; }

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private api = inject(PublicApiService);

  schedule = signal<ScheduleDTO | null>(null);
  heroBanner = signal<HeroBanner | null>(null);

  ngOnInit() {
    this.api.getPublicSchedules().subscribe({
      next: data => this.schedule.set(data[0] ?? null),
    });
    this.api.getBanners('HERO').subscribe({
      next: data => this.heroBanner.set(data[0] ?? null),
    });
  }
}
