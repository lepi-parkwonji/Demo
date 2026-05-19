import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from '@demo-shop/ui';
import { FooterComponent } from '../footer/footer.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { WideBannerComponent } from '../wide-banner/wide-banner.component';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, TopBarComponent, FooterComponent, WideBannerComponent, NgClass],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  toastSvc = inject(ToastService);
}
