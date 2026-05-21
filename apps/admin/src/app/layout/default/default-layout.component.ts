import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { ToastService } from '@demo-shop/ui';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, TopBarComponent, SideMenuComponent, NgClass],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  toastSvc = inject(ToastService);
}
