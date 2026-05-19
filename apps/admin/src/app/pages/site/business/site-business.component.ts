import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { formatBusinessNumber, formatPhoneNumber } from '@demo-shop/common';
import { ToastService } from '@demo-shop/ui';

interface SiteSettings {
  businessName: string;
  businessNo: string;
  ceoName: string;
  address: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-site-business',
  imports: [FormsModule],
  templateUrl: './site-business.component.html',
})
export class SiteBusinessComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(false);
  saving = signal(false);

  businessName = '';
  businessNo = '';
  ceoName = '';
  address = '';
  phone = '';
  email = '';

  ngOnInit() {
    this.loading.set(true);
    this.http.get<SiteSettings>('/api/site/business').subscribe({
      next: data => {
        this.businessName = data.businessName;
        this.businessNo   = formatBusinessNumber(data.businessNo ?? '');
        this.ceoName      = data.ceoName;
        this.address      = data.address;
        this.phone        = formatPhoneNumber(data.phone ?? '');
        this.email        = data.email;
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.loading.set(false),
    });
  }

  onSubmit() {
    this.saving.set(true);
    this.http.patch('/api/site/business', {
      businessName: this.businessName,
      businessNo:   this.businessNo,
      ceoName:      this.ceoName,
      address:      this.address,
      phone:        this.phone,
      email:        this.email,
    }).subscribe({
      next: () => { this.toast.success('저장되었습니다.'); this.saving.set(false); this.router.navigate(['/site/terms']); },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }
}
